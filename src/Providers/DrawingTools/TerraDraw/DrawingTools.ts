// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace Provider.DrawingTools.TerraDraw {
	/** Provider events reuse the same names as Google Drawing Manager for framework compatibility. */
	const _providerEvents = [
		OSFramework.Maps.Helper.Constants.drawingCircleCompleted,
		OSFramework.Maps.Helper.Constants.drawingMarkerCompleted,
		OSFramework.Maps.Helper.Constants.drawingPolylineCompleted,
		OSFramework.Maps.Helper.Constants.drawingPolygonCompleted,
		OSFramework.Maps.Helper.Constants.drawingRectangleCompleted,
	];

	export class DrawingTools extends OSFramework.Maps.DrawingTools.AbstractDrawingTools<
		TerraDrawProviderCompatible,
		OSFramework.Maps.Configuration.IConfigurationDrawingTools
	> {
		private readonly _modeToTool: Map<
			string,
			AbstractProviderTool<OSFramework.Maps.Configuration.IConfigurationTool>
		>;
		private _ui: DrawingToolsUi;

		constructor(map: OSFramework.Maps.OSMap.IMap, drawingToolsId: string, configs: JSON) {
			super(map, drawingToolsId, new Configuration.DrawingToolsConfig(configs));
			this._modeToTool = new Map();
		}

		private _buildModes(): TerraDrawBaseDrawMode[] {
			const modes: TerraDrawBaseDrawMode[] = this.tools.map((tool) =>
				(tool as AbstractProviderTool<OSFramework.Maps.Configuration.IConfigurationTool>).createTerraDrawMode()
			);

			// Always include a select mode so the user can deselect drawing without reloading
			modes.push(
				new globalThis.terraDraw.TerraDrawSelectMode({
					flags: {
						circle: { feature: { draggable: true } },
						linestring: {
							feature: {
								draggable: true,
								rotateable: true,
								coordinates: { midpoints: true, draggable: true, deletable: true },
							},
						},
						marker: { feature: { draggable: true } },
						polygon: {
							feature: {
								draggable: true,
								rotateable: true,
								coordinates: { midpoints: true, draggable: true, deletable: true },
							},
						},
						rectangle: { feature: { draggable: true } },
					},
				})
			);

			return modes;
		}

		private _buildTerraDraw(): void {
			if (this._provider) {
				this._provider.stop();
			}

			this._provider = new globalThis.terraDraw.TerraDraw({
				adapter: this._getAdapter(),
				modes: this._buildModes(),
			}) as TerraDrawProviderCompatible;

			this._provider.on('finish', (id, context) => this._onFinish(id, context));

			// this._provider.start();

			this._modeToTool.clear();
			this.tools.forEach((tool) => {
				this._modeToTool.set(
					tool.type,
					tool as AbstractProviderTool<OSFramework.Maps.Configuration.IConfigurationTool>
				);
			});
		}

		private _getAdapter(): TerraDrawGoogleMapsAdapter {
			if (this.config.providerType === OSFramework.Maps.Enum.ProviderType.Google) {
				return new globalThis.terraDrawGoogleMapsAdapter.TerraDrawGoogleMapsAdapter({
					map: this.map.provider as google.maps.Map,
					lib: google.maps,
					coordinatePrecision: 9,
				});
			} else {
				throw new Error(`There is no adapter for the provider ${this.config.providerType}`);
			}
		}

		private _onFinish(featureId: TerraDrawFeatureId, context: { action: string; mode: string }): void {
			if (context.action !== 'draw') {
				return;
			}

			const tool = this._modeToTool.get(context.mode);
			if (!tool) {
				return;
			}

			const feature = this._provider.getSnapshotFeature(featureId);
			tool.handleFinish(feature);

			// Remove the TerraDraw overlay — the shape is now owned by the OS framework
			this._provider.removeFeatures([featureId]);

			// Return to a neutral state
			this._provider.setMode(Constants.ModeName.Select);
			this._ui?.setDefaultMode();
		}

		public addTool(tool: OSFramework.Maps.DrawingTools.ITool): OSFramework.Maps.DrawingTools.ITool {
			super.addTool(tool);

			if (this.isReady) {
				tool.build();

				const modeNames = this.tools.map((t) => t.type);
				this._ui?.refresh(modeNames, this.config.position);
			}

			return tool;
		}

		public build(): void {
			super.build();

			const configs = this.getProviderConfig();

			this._buildTerraDraw();
			this.tools.forEach((tool) => tool.build());

			const mapElement = OSFramework.Maps.Helper.GetElementByUniqueId(this.map.uniqueId);
			const mapContainer = mapElement?.querySelector<HTMLElement>(
				OSFramework.Maps.Helper.Constants.runtimeMapUniqueIdCss
			);

			if (mapContainer) {
				this._ui = new DrawingToolsUi(
					mapContainer,
					(modeName) => {
						this._provider.start();
						this._provider.setMode(modeName);
					},
					() => {
						this._provider.setMode(Constants.ModeName.Select);
						this._ui.setDefaultMode();
					}
				);
				this._ui.build(modeNames, configs.position);
				const modeNames = this.tools.map((t) => t.type);
			}

			this.finishBuild();
		}

		public changeProperty(propertyName: string, value: unknown): void {
			const propValue = OSFramework.Maps.Enum.OS_Config_DrawingTools[propertyName];
			super.changeProperty(propertyName, value);
			if (this.isReady) {
				if (propValue === OSFramework.Maps.Enum.OS_Config_DrawingTools.position) {
					const modeNames = this.tools.map((t) => t.type);
					this._ui?.refresh(modeNames, value as string);
				}
			}
		}

		public dispose(): void {
			if (this.isReady) {
				this._provider.stop();
				this._ui?.dispose();
			}
			this._provider = undefined;
			this._ui = undefined;
			super.dispose();
		}

		public get providerEvents(): Array<string> {
			return _providerEvents;
		}

		public refreshProviderEvents(): void {
			// Events are wired once in _buildTerraDraw — no-op for post-build refresh calls
		}

		public removeTool(toolId: string): void {
			super.removeTool(toolId);

			if (this.isReady) {
				const modeNames = this.tools.map((t) => t.type);
				this._ui?.refresh(modeNames, this.config.position);
			}
		}
	}
}
