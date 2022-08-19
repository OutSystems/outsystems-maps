/// <reference path="AbstractDrawShape.ts" />

// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace Provider.Leaflet.DrawingTools {
    export class DrawCircle extends AbstractDrawShape<Configuration.DrawingTools.DrawFilledShapeConfig> {
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

        private _createConfigsElement(
            shape: L.Circle,
            configs: Configuration.Shape.CircleShapeConfig
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ): Configuration.Shape.CircleShapeConfig {
            const providerCenter = shape.getLatLng();
            const center = `${providerCenter.lat},${providerCenter.lng}`;
            const radius = shape.getRadius();

            // Join both the configs that were provided for the new shape element and the location that was provided by the DrawingTools shapecomplete event
            const finalConfigs = {
                ...configs,
                center,
                radius
            };
            return finalConfigs as Configuration.Shape.CircleShapeConfig;
        }

        /** Get the constant for the event polygoncomplete */
        protected get completedToolEventName(): string {
            return OSFramework.Helper.Constants.drawingCircleCompleted;
        }

        //TODO: create structure for circle options
        // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
        public get options(): any {
            return this.internalOptions;
        }

        //TODO: create structure for circle options
        // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
        protected set options(options: any) {
            const allOptions = { ...this.options, ...options };
            const shapeOptions = {
                ...this.options?.shapeOptions,
                ...options.shapeOptions
            };
            allOptions.shapeOptions = shapeOptions;

            this.drawingTools.provider.setDrawingOptions({
                circle: allOptions
            });

            this.internalOptions = allOptions;
        }

        protected createElement(
            uniqueId: string,
            shape: L.Circle,
            configs: Configuration.Shape.CircleShapeConfig
        ): OSFramework.Shape.IShape {
            // we need to clean the provided configs and add the locations in order to create the new element
            // DrawPolyline and DrawPolygon use the following method to add the locations into the initial configs
            const finalConfigs = this._createConfigsElement(shape, configs);
            return super.createShapeElement(
                uniqueId,
                OSFramework.Enum.ShapeType.Circle,
                finalConfigs
            );
        }

        protected getCoordinates(): string {
            const locations = this.newElm.config.center;
            let coordinatesArray = [];

            coordinatesArray = locations.split(',');

            const coordinates = {
                Lat: coordinatesArray[0],
                Lng: coordinatesArray[1]
            };

            return JSON.stringify(coordinates);
        }

        /** Gets the location of the new shape (circle), as a string */
        protected getLocation(): string {
            const location = this.newElm.config.center;
            const radius = this.newElm.config.radius;

            // Get the location and radius and return as object stringified to pass to platform event
            const locationConfig = { location: location, radius: radius };
            return JSON.stringify(locationConfig);
        }
    }
}
