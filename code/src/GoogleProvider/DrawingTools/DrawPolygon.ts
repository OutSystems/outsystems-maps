/// <reference path="AbstractDrawPolyshape.ts" />

// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace GoogleProvider.DrawingTools {
    export class DrawPolygon extends AbstractDrawPolyshape<Configuration.DrawingTools.DrawFilledShapeConfig> {
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

        /** Get the constant for the event polygoncomplete */
        protected get completedToolEventName(): string {
            return OSFramework.Helper.Constants.drawingPolygonCompleted;
        }

        protected get options(): google.maps.PolygonOptions {
            return this.drawingTools.provider.get('polygonOptions');
        }

        protected set options(options: google.maps.PolygonOptions) {
            const allOptions = { ...this.options, ...options };
            this.drawingTools.provider.setOptions({
                polygonOptions: allOptions
            });
        }

        protected createElement(
            uniqueId: string,
            shape: google.maps.Polygon,
            // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
            configs: any
        ): OSFramework.Shape.IShape {
            // we need to clean the provided configs in order to create the new element
            const finalConfigs = super.createConfigsElement(shape, configs);

            return super.createShapeElement(
                uniqueId,
                OSFramework.Enum.ShapeType.Polygon,
                finalConfigs
            );
        }
    }
}
