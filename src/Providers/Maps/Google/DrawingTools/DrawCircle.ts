/// <reference path="AbstractDrawShape.ts" />

// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace Provider.Maps.Google.DrawingTools {
    export class DrawCircle extends AbstractDrawShape<Configuration.DrawingTools.DrawFilledShapeConfig> {
        constructor(
            map: OSFramework.Maps.OSMap.IMap,
            drawingTools: OSFramework.Maps.DrawingTools.IDrawingTools,
            drawingToolsId: string,
            type: string,
            configs: JSON
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
            shape: google.maps.Circle,
            configs: Configuration.Shape.CircleShapeConfig
        ): any {
            const providerCenter = shape.getCenter();
            const center = `${providerCenter.lat()},${providerCenter.lng()}`;
            const radius = shape.getRadius();

            // Join both the configs that were provided for the new shape element and the location that was provided by the DrawingTools shapecomplete event
            const finalConfigs = {
                ...configs,
                center,
                radius
            };
            return finalConfigs;
        }

        /** Get the constant for the event polygoncomplete */
        protected get completedToolEventName(): string {
            return OSFramework.Maps.Helper.Constants.drawingCircleCompleted;
        }

        public get options(): google.maps.CircleOptions {
            return this.drawingTools.provider.get('circleOptions');
        }

        protected set options(options: google.maps.CircleOptions) {
            const allOptions = { ...this.options, ...options };
            this.drawingTools.provider.setOptions({
                circleOptions: allOptions
            });
        }

        protected createElement(
            uniqueId: string,
            shape: google.maps.Circle,
            configs: Configuration.Shape.CircleShapeConfig
        ): OSFramework.Maps.Shape.IShape {
            // we need to clean the provided configs and add the locations in order to create the new element
            // DrawPolyline and DrawPolygon use the following method to add the locations into the initial configs
            const finalConfigs = this._createConfigsElement(shape, configs);
            return super.createShapeElement(
                uniqueId,
                OSFramework.Maps.Enum.ShapeType.Circle,
                finalConfigs
            );
        }

        /** Gets the coordinates of the new shape (circle), with the expected lat/lng structure */
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
            // Get the location and radius and return as object stringfied to pass to platform event
            const locationConfig = { location: location, radius: radius };
            return JSON.stringify(locationConfig);
        }
    }
}
