// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace Provider.DrawingTools.TerraDraw {
	/**
	 * Provider event names intentionally mirror those used by the Google DrawingManager
	 * integration so that the OutSystems framework event-wiring layer (DrawingToolsManager)
	 * requires no changes when switching between providers.
	 */
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

		/**
		 * (Re)creates the TerraDraw instance from the current tool list.
		 * If a previous instance exists it is stopped first — TerraDraw does not
		 * support hot-swapping modes, so the entire instance must be replaced.
		 */
		private _buildTerraDraw(): void {
			if (this._provider) {
				this._provider.stop();
			}

			this._provider = new globalThis.terraDraw.TerraDraw({
				adapter: this._getAdapter(),
				modes: this._buildModes(),
			}) as TerraDrawProviderCompatible;

			this._provider.on('finish', (id, context) => this._onFinish(id, context));

			// start() is intentionally deferred: the provider is started on the first
			// toolbar interaction (see build()) to avoid TerraDraw intercepting map
			// pointer events before the user activates any drawing tool.

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

		/**
		 * Central handler for TerraDraw's 'finish' event.
		 * TerraDraw fires 'finish' for every completed interaction — drawing, editing,
		 * dragging, and rotating — distinguished by context.action. We only act on
		 * 'draw' to avoid creating duplicate OS elements for post-creation edits.
		 */
		private _onFinish(featureId: TerraDrawFeatureId, context: { action: string; mode: string }): void {
			if (context.action !== 'draw') {
				return;
			}

			const tool = this._modeToTool.get(context.mode);
			if (!tool) {
				return;
			}

			const feature = this._provider.getSnapshotFeature(featureId);
			try {
				tool.handleFinish(feature);
			} catch (error) {
				this.map.mapEvents.trigger(
					OSFramework.Maps.Event.OSMap.MapEventType.OnError,
					this.map,
					OSFramework.Maps.Enum.ErrorCodes.API_FailedCreatingShape,
					`Failed to create shape: ${error instanceof Error ? error.message : String(error)}`
				);
			}

			// Remove the TerraDraw overlay — the shape is now owned by the OS framework
			this._provider.removeFeatures([featureId]);

			// Return to a neutral state - Leaflet behaviour ⬇️           //
			// this._provider.setMode(Constants.ModeName.Select);         //
			// this._ui?.setDefaultMode();                                //
			// Commenting out the code emulates the Google Maps behaviour //
		}

		public addTool(tool: OSFramework.Maps.DrawingTools.ITool): OSFramework.Maps.DrawingTools.ITool {
			super.addTool(tool);

			this._modeToTool.set(
				tool.type,
				tool as AbstractProviderTool<OSFramework.Maps.Configuration.IConfigurationTool>
			);

			if (this.isReady) {
				tool.build();

				const modeNames = this.tools.map((t) => t.type);
				this._ui?.refresh(modeNames, this.config.position);
			}

			return tool;
		}

		public build(): void {
			super.build();

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
						if (!this._provider.enabled) {
							this._provider.start();
						}

						this._provider.setMode(modeName);
					},
					() => {
						this._provider.setMode(Constants.ModeName.Select);
						this._ui.setDefaultMode();
					}
				);
				const modeNames = this.tools.map((t) => t.type);
				this._ui.build(modeNames, this.config.position);
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
			const tool = this.getTool(toolId);

			super.removeTool(toolId);

			tool && this._modeToTool.delete(tool.type);

			if (this.isReady) {
				const modeNames = this.tools.map((t) => t.type);
				this._ui?.refresh(modeNames, this.config.position);
			}
		}
	}
}
