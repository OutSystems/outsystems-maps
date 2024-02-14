/// <reference path="../../../../OSFramework/Maps/DrawingTools/AbstractDrawingTools.ts" />

// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace Provider.Maps.Google.DrawingTools {
	export class DrawingTools extends OSFramework.Maps.DrawingTools.AbstractDrawingTools<
		google.maps.drawing.DrawingManager,
		OSFramework.Maps.Configuration.IConfigurationDrawingTools
	> {
		protected _provider: google.maps.drawing.DrawingManager;
		constructor(map: OSFramework.Maps.OSMap.IMap, drawingToolsId: string, configs: JSON) {
			super(map, drawingToolsId, new Configuration.DrawingTools.DrawingToolsConfig(configs));
		}

		private _refreshDrawingModes(): void {
			const drawingControlOptions = this.provider.get('drawingControlOptions');
			this.provider.setOptions({
				drawingMode: null,
				drawingControlOptions: {
					...drawingControlOptions,
					drawingModes: this.tools.map((tool) => tool.type),
				},
			});
		}

		private _refreshDrawingTools(): void {
			// Reset all the events for the DrawingTools provider and the events for the tools that are contained on the DrawingTools box
			this._setDrawingToolsEvents();
			// After adding/removing a new Tool we need to refresh the drawingModes to add the new tool into the drawingtools box
			this._refreshDrawingModes();
		}

		private _setDrawingToolsEvents(): void {
			// Make sure the listeners get removed before adding the new ones
			google.maps.event.clearInstanceListeners(this.provider);

			// Add the handler that will create the shape/marker element and remove the overlay created by the drawing tool on the map
			this.tools.forEach((tool) => tool.addCompletedEvent());
		}

		protected get controlOptions(): google.maps.drawing.DrawingControlOptions {
			return this._provider.get('drawingControlOptions');
		}

		protected set controlOptions(options: google.maps.drawing.DrawingControlOptions) {
			const allOptions = { ...this.controlOptions, ...options };
			this._provider.setOptions({
				drawingControlOptions: allOptions,
			});
		}

		public get providerEvents(): Array<string> {
			return Constants.DrawingTools.Events;
		}

		public addTool(tool: OSFramework.Maps.DrawingTools.ITool): OSFramework.Maps.DrawingTools.ITool {
			super.addTool(tool);

			if (this.isReady) {
				tool.build();
				this._refreshDrawingTools();
			}

			return tool;
		}

		public build(): void {
			super.build();

			const configs: OSFramework.Maps.Configuration.IConfigurationDrawingTools = this.getProviderConfig();

			this._provider = new google.maps.drawing.DrawingManager({
				drawingMode: null,
				drawingControl: true,
				drawingControlOptions: {
					position: parseInt(google.maps.ControlPosition[configs.position]),
					drawingModes: this.tools.map((tool) => OSFramework.Maps.Enum.DrawingToolsTypes[tool.type]),
				},
				polylineOptions: {},
				markerOptions: {},
			});

			this._provider.setMap(this.map.provider);
			this.tools.forEach((tool) => tool.build());
			// Set all the events for the DrawingTools provider and the events for the tools that are contained on the DrawingTools box
			// After adding a new Tool we need to refresh the drawingModes to add the new tool into the drawingtools box
			this._refreshDrawingTools();
			this.finishBuild();
		}

		// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
		public changeProperty(propertyName: string, value: any): void {
			const propValue = OSFramework.Maps.Enum.OS_Config_DrawingTools[propertyName];
			super.changeProperty(propertyName, value);
			if (this.isReady) {
				switch (propValue) {
					case OSFramework.Maps.Enum.OS_Config_DrawingTools.position:
						this.controlOptions = {
							position: parseInt(google.maps.ControlPosition[value]),
						};
						return;
				}
			}
		}

		public dispose(): void {
			if (this.isReady) {
				this.provider.set('map', null);
			}
			this._provider = undefined;
			super.dispose();
		}

		public refreshProviderEvents(): void {
			if (this.isReady) this._setDrawingToolsEvents();
		}

		public removeTool(toolId: string): void {
			super.removeTool(toolId);

			// Reset all the events for the DrawingTools provider and the events for the tools that are contained on the DrawingTools box
			// After removing a new Tool we need to refresh the drawingModes to add the new tool into the drawingtools box
			this._refreshDrawingTools();
		}
	}
}
