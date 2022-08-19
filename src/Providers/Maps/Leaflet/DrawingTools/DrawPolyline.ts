// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace Provider.Leaflet.DrawingTools {
    export class DrawPolyline extends AbstractDrawShape<Configuration.DrawingTools.DrawBasicShapeConfig> {
        constructor(
            map: OSFramework.OSMap.IMap,
            drawingTools: OSFramework.DrawingTools.IDrawingTools,
            drawingToolsId: string,
            type: string,
            configs: Configuration.DrawingTools.DrawBasicShapeConfig
        ) {
            super(
                map,
                drawingTools,
                drawingToolsId,
                type,
                new Configuration.DrawingTools.DrawBasicShapeConfig(configs)
            );
        }

        /** Get the constant for the event polylinecomplete */
        protected get completedToolEventName(): string {
            return OSFramework.Helper.Constants.drawingPolylineCompleted;
        }

        //TODO: create structure for polyline options
        // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
        public get options(): any {
            return this.internalOptions;
        }

        //TODO: create structure for polyline options
        // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
        protected set options(options: any) {
            const allOptions = { ...this.options, ...options };
            const shapeOptions = {
                ...this.options?.shapeOptions,
                ...options.shapeOptions
            };
            allOptions.shapeOptions = shapeOptions;
            this.drawingTools.provider.setDrawingOptions({
                polyline: allOptions
            });
            this.internalOptions = allOptions;
        }

        /** Adds the location to the configurations of the new shape (polyline or polygon) */
        private _createConfigsElement(
            shape: L.Polyline,
            configs: Configuration.Shape.BasicShapeConfig
        ): Configuration.Shape.BasicShapeConfig {
            const locations = shape
                .getLatLngs()
                .map((elm) => `${elm.lat},${elm.lng}`);

            // Join both the configs that were provided for the new shape element and the location that was provided by the DrawingTools shapecomplete event
            const finalConfigs = {
                ...configs,
                locations: JSON.stringify(locations)
            };
            return finalConfigs as Configuration.Shape.BasicShapeConfig;
        }

        protected createElement(
            uniqueId: string,
            shape: L.Polyline,
            configs: Configuration.Shape.BasicShapeConfig
        ): OSFramework.Shape.IShape {
            // we need to clean the provided configs and add the locations in order to create the new element
            // DrawPolyline and DrawPolygon use the following method to add the locations into the initial configs
            const finalConfigs = this._createConfigsElement(shape, configs);

            return super.createShapeElement(
                uniqueId,
                OSFramework.Enum.ShapeType.Polyline,
                finalConfigs
            );
        }
    }
}
