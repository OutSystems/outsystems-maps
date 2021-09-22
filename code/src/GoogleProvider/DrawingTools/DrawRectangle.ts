/// <reference path="AbstractDrawShape.ts" />

// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace GoogleProvider.DrawingTools {
    export class DrawRectangle extends AbstractDrawShape<Configuration.DrawingTools.DrawFilledShapeConfig> {
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
            shape: google.maps.Rectangle,
            // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
            configs: Configuration.Shape.RectangleShapeConfig
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ): any {
            const providerBounds = shape.getBounds();
            const bounds: OSFramework.OSStructures.OSMap.BoundsString = {
                north: providerBounds.getNorthEast().lat().toString(),
                south: providerBounds.getSouthWest().lat().toString(),
                west: providerBounds.getSouthWest().lng().toString(),
                east: providerBounds.getNorthEast().lng().toString()
            };

            // Join both the configs that were provided for the new shape element and the location that was provided by the DrawingTools shapecomplete event
            const finalConfigs = {
                ...configs,
                bounds: JSON.stringify(bounds)
            };
            return finalConfigs as Configuration.Shape.RectangleShapeConfig;
        }

        /** Get the constant for the event polygoncomplete */
        protected get completedToolEventName(): string {
            return OSFramework.Helper.Constants.drawingRectangleCompleted;
        }

        protected get options(): google.maps.RectangleOptions {
            return this.drawingTools.provider.get('rectangleOptions');
        }

        protected set options(options: google.maps.RectangleOptions) {
            const allOptions = { ...this.options, ...options };
            this.drawingTools.provider.setOptions({
                rectangleOptions: allOptions
            });
        }

        protected createElement(
            uniqueId: string,
            shape: google.maps.Rectangle,
            // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
            configs: Configuration.Shape.RectangleShapeConfig
        ): OSFramework.Shape.IShape {
            const finalConfigs = this._createConfigsElement(shape, configs);

            return super.createShapeElement(
                uniqueId,
                OSFramework.Enum.ShapeType.Rectangle,
                finalConfigs
            );
        }
    }
}
