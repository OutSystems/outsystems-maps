/// <reference path="AbstractDrawShape.ts" />

// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace GoogleProvider.DrawingTools {
    export class DrawCircle extends AbstractDrawShape<Configuration.DrawingTools.DrawFilledShapeConfig> {
        constructor(
            map: OSFramework.OSMap.IMap,
            drawingTools: OSFramework.DrawingTools.IDrawingTools,
            drawingToolsId: string,
            type: string,
            // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
            configs: any
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
            // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
            configs: any
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ): any {
            // DrawShap
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
            return OSFramework.Helper.Constants.drawingCircleCompleted;
        }

        protected get options(): google.maps.CircleOptions {
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
            // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
            configs: any
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
    }
}
