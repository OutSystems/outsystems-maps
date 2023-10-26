/// <reference path="../../../../OSFramework/Maps/DrawingTools/AbstractDrawingTools.ts" />

// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace Provider.Maps.Leaflet.DrawingTools {
    class ToolsList {
        //TODO - Create/optimize types for all the tools by using a global.d.ts or ussi
        //     - In that moment each tool should be boolean | NEW_TYPE because the empty state is false.
        public circle: unknown;
        public circlemarker: boolean;
        public marker: unknown;
        public polygon: unknown;
        public polyline: unknown;
        public rectangle: unknown;

        constructor() {
            this.circlemarker = false; // this tool isn't provided by our experience
            // By default the tools are marked with false, this means that if the configs don't show up the tool will not be added (it's disabled).
            // DrawingTools is a wrapper of Tools, the configs have to be on the wrapper level (Leaflet requirement),
            // but on our experience they are provided by each Tool.
            this.circle = false;
            this.marker = false;
            this.polygon = false;
            this.polyline = false;
            this.rectangle = false;
        }
    }

    export class DrawingTools extends OSFramework.Maps.DrawingTools
        .AbstractDrawingTools<
        L.Control, //TODO - this type should be more specific (Drawing Tool)
        OSFramework.Maps.Configuration.IConfigurationDrawingTools
    > {
        // FeatureGroup <any>: as required by Leaflet
        private _toolsGroup: L.FeatureGroup<unknown>;
        //TODO - At the moment the type is not well defined and it doesn't included setDrawingOptions for example,
        //     - When this is done the overwrite of the _provider is not needed anymore.
        //protected _provider: any;

        constructor(
            map: OSFramework.Maps.OSMap.IMap,
            drawingToolsId: string,
            configs: Configuration.DrawingTools.DrawingToolsConfig
        ) {
            super(
                map,
                drawingToolsId,
                new Configuration.DrawingTools.DrawingToolsConfig(configs)
            );

            this._toolsGroup = new L.FeatureGroup();
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        private _addCompletedEventHandler(event: any): void {
            const toolType = event.layerType;

            this.tools
                .filter((element) => element.type === toolType)
                .forEach((element) => element.addCompletedEvent(event));
        }

        private _getDrawingToolsPosition(
            position: string
        ): Constants.DrawingTools.Positions {
            if (Constants.DrawingTools.Positions[position] !== undefined) {
                return Constants.DrawingTools.Positions[position];
            } else {
                OSFramework.Maps.Helper.ThrowError(
                    this.map,
                    OSFramework.Maps.Enum.ErrorCodes
                        .CFG_InvalidDrawingToolsPosition,
                    `${position}`
                );
                return;
            }
        }

        //TODO: create the return structure
        private _getTools(): ToolsList {
            const _tools = new ToolsList();
            this.tools.forEach((tool) => {
                switch (tool.type) {
                    case OSFramework.Maps.Enum.DrawingToolsTypes.Circle:
                        _tools.circle = tool.options;
                        break;
                    case OSFramework.Maps.Enum.DrawingToolsTypes.Marker:
                        _tools.marker = tool.options;
                        break;
                    case OSFramework.Maps.Enum.DrawingToolsTypes.Polygon:
                        _tools.polygon = tool.options;
                        break;
                    case OSFramework.Maps.Enum.DrawingToolsTypes.Polyline:
                        _tools.polyline = tool.options;
                        break;
                    case OSFramework.Maps.Enum.DrawingToolsTypes.Rectangle:
                        _tools.rectangle = tool.options;
                        break;
                    default:
                        break;
                }
            });

            return _tools;
        }

        private _refreshDrawingModes(): void {
            const drawingOptions = this.provider.options;
            const finalDrawingOptions = {
                ...drawingOptions,
                draw: this._getTools()
            };
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            //@ts-ignore
            this._provider.setDrawingOptions(finalDrawingOptions.draw);
        }

        private _refreshDrawingTools(): void {
            // Reset all the events for the DrawingTools provider and the events for the tools that are contained on the DrawingTools box
            this._setDrawingToolsEvents();
            // After adding/removing a new Tool we need to refresh the drawingModes to add the new tool into the drawingtools box
            this._refreshDrawingModes();
            this.map.provider.addControl(this._provider);
        }

        private _setDrawingToolsEvents(): void {
            // Make sure the listeners get removed before adding the new ones
            this.map.provider.off(
                OSFramework.Maps.Helper.Constants.drawingLeafletCompleted
            );

            // Add the handler that will create the shape/marker element and remove the overlay created by the drawing tool on the map
            this.map.provider.on(
                OSFramework.Maps.Helper.Constants.drawingLeafletCompleted,
                this._addCompletedEventHandler.bind(this)
            );
        }

        // We don't have the types for the drawingTools features
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        protected get controlOptions(): any {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            //@ts-ignore
            return this._provider.get('drawingControlOptions');
        }

        // We don't have the types for the drawingTools features
        protected set controlOptions(options: unknown[]) {
            const allOptions = { ...this.controlOptions, ...options };
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            //@ts-ignore
            this._provider.setOptions({
                drawingControlOptions: allOptions
            });
        }

        public get providerEvents(): Array<string> {
            return Constants.DrawingTools.Events;
        }

        public addTool(
            tool: OSFramework.Maps.DrawingTools.ITool
        ): OSFramework.Maps.DrawingTools.ITool {
            super.addTool(tool);

            if (this.isReady) {
                tool.build();
                this._refreshDrawingTools();
            }

            return tool;
        }

        public build(): void {
            super.build();

            const configs: OSFramework.Maps.Configuration.IConfigurationDrawingTools =
                this.getProviderConfig();

            this.map.provider.addLayer(this._toolsGroup);
            //TODO - Add the types of L.Draw so this ignore is not needed.
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            //@ts-ignore
            this._provider = new L.Control.Draw({
                position:
                    this._getDrawingToolsPosition(configs.position) ||
                    Constants.DrawingTools.Positions.TOP_LEFT,
                edit: {
                    featureGroup: this._toolsGroup,
                    edit: false,
                    remove: false
                },
                draw: this._getTools()
            });
            this.tools.forEach((tool) => tool.build());
            // Set all the events for the DrawingTools provider and the events for the tools that are contained on the DrawingTools box
            // After adding a new Tool we need to refresh the drawingModes to add the new tool into the drawingtools box
            this._refreshDrawingTools();
            this.finishBuild();
        }

        public changeProperty(
            propertyName: string,
            propertyValue: unknown
        ): void {
            const propValue =
                OSFramework.Maps.Enum.OS_Config_DrawingTools[propertyName];
            super.changeProperty(propertyName, propertyValue);
            if (this.isReady) {
                switch (propValue) {
                    case OSFramework.Maps.Enum.OS_Config_DrawingTools.position:
                        // eslint-disable-next-line no-case-declarations
                        const positionValue = this._getDrawingToolsPosition(
                            propertyValue as string
                        );
                        positionValue &&
                            this.provider.setPosition(positionValue);
                        return;
                }
            }
        }

        public dispose(): void {
            if (this.isReady) {
                this.map.provider.removeControl(this._provider);
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
