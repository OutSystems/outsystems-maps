/// <reference path="AbstractDrawPolyshape.ts" />

// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace Provider.Maps.Google.DrawingTools {
    export class DrawPolygon extends AbstractDrawPolyshape<Configuration.DrawingTools.DrawFilledShapeConfig> {
        constructor(
            map: OSFramework.Maps.OSMap.IMap,
            drawingTools: OSFramework.Maps.DrawingTools.IDrawingTools,
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
            return OSFramework.Maps.Helper.Constants.drawingPolygonCompleted;
        }

        public get options(): google.maps.PolygonOptions {
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
            configs: Configuration.Shape.FilledShapeConfig
        ): OSFramework.Maps.Shape.IShape {
            // we need to clean the provided configs and add the locations in order to create the new element
            // DrawPolyline and DrawPolygon use the following method to add the locations into the initial configs
            const finalConfigs = super.createConfigsElement(shape, configs);

            return super.createShapeElement(
                uniqueId,
                OSFramework.Maps.Enum.ShapeType.Polygon,
                finalConfigs
            );
        }
    }
}
