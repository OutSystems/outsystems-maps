// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace LeafletProvider.DrawingTools {
    export class DrawPolygon extends AbstractDrawShape<Configuration.DrawingTools.DrawFilledShapeConfig> {
        constructor(
            map: OSFramework.OSMap.IMap,
            drawingTools: OSFramework.DrawingTools.IDrawingTools,
            drawingToolsId: string,
            type: string,
            configs: Configuration.DrawingTools.DrawFilledShapeConfig
        ) {
            super(
                map,
                drawingTools,
                drawingToolsId,
                type,
                new Configuration.DrawingTools.DrawFilledShapeConfig(configs)
            );
        }

        /** Get the constant for the event polygoncomplete */
        protected get completedToolEventName(): string {
            return OSFramework.Helper.Constants.drawingPolygonCompleted;
        }

        //TODO: create structure for Polygon options
        // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
        public get options(): any {
            return this.internalOptions;
        }

        //TODO: create structure for Polygon options
        // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
        protected set options(options: any) {
            const allOptions = { ...this.options, ...options };
            const shapeOptions = {
                ...this.options?.shapeOptions,
                ...options.shapeOptions
            };
            allOptions.shapeOptions = shapeOptions;
            this.drawingTools.provider.setDrawingOptions({
                polygon: allOptions
            });
            this.internalOptions = allOptions;
        }

        /** Adds the location to the configurations of the new shape (polyline or polygon) */
        private _createConfigsElement(
            shape: L.Polygon,
            configs: Configuration.Shape.FilledShapeConfig
        ): Configuration.Shape.FilledShapeConfig {
            const locations = (shape.getLatLngs()[0] as Array<L.LatLng>).map(
                (elm) => `${elm.lat},${elm.lng}`
            );

            // Join both the configs that were provided for the new shape element and the location that was provided by the DrawingTools shapecomplete event
            const finalConfigs = {
                ...configs,
                locations: JSON.stringify(locations)
            };
            return finalConfigs as Configuration.Shape.FilledShapeConfig;
        }

        protected createElement(
            uniqueId: string,
            shape: L.Polygon,
            configs: Configuration.Shape.FilledShapeConfig
        ): OSFramework.Shape.IShape {
            // we need to clean the provided configs and add the locations in order to create the new element
            // DrawPolyline and DrawPolygon use the following method to add the locations into the initial configs
            const finalConfigs = this._createConfigsElement(shape, configs);

            return super.createShapeElement(
                uniqueId,
                OSFramework.Enum.ShapeType.Polygon,
                finalConfigs
            );
        }
    }
}
