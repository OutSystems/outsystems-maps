/// <reference path="AbstractDrawPolyshape.ts" />

// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace Provider.Maps.Google.DrawingTools {
    export class DrawPolyline extends AbstractDrawPolyshape<Configuration.DrawingTools.DrawBasicShapeConfig> {
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
                new Configuration.DrawingTools.DrawBasicShapeConfig(configs)
            );
        }

        /** Get the constant for the event polylinecomplete */
        protected get completedToolEventName(): string {
            return OSFramework.Maps.Helper.Constants.drawingPolylineCompleted;
        }

        /** Get the polyline options from the drawing tools element (provider) */
        public get options(): google.maps.PolylineOptions {
            return this.drawingTools.provider.get('polylineOptions');
        }

        /** Set the polyline options on the drawing tools element (provider) */
        protected set options(options: google.maps.PolylineOptions) {
            const allOptions = { ...this.options, ...options };
            this.drawingTools.provider.setOptions({
                polylineOptions: allOptions
            });
        }

        protected createElement(
            uniqueId: string,
            shape: google.maps.Polyline,
            configs: Configuration.Shape.BasicShapeConfig
        ): OSFramework.Maps.Shape.IShape {
            // we need to clean the provided configs and add the locations in order to create the new element
            // DrawPolyline and DrawPolygon use the following method to add the locations into the initial configs
            const finalConfigs = super.createConfigsElement(shape, configs);

            return super.createShapeElement(
                uniqueId,
                OSFramework.Maps.Enum.ShapeType.Polyline,
                finalConfigs
            );
        }
    }
}
