/// <reference path="AbstractDrawPolyshape.ts" />

// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace GoogleProvider.DrawingTools {
    export class DrawPolyline extends AbstractDrawPolyshape<Configuration.DrawingTools.DrawBasicShapeConfig> {
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
                new Configuration.DrawingTools.DrawBasicShapeConfig(configs)
            );
        }

        /** Get the constant for the event polylinecomplete */
        protected get completedToolEventName(): string {
            return OSFramework.Helper.Constants.drawingPolylineCompleted;
        }

        /** Get the polyline options from the drawing tools element (provider) */
        protected get options(): google.maps.PolylineOptions {
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
            // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
            configs: any
        ): OSFramework.Shape.IShape {
            // we need to clean the provided configs in order to create the new element
            const finalConfigs = super.createConfigsElement(shape, configs);

            return super.createShapeElement(
                uniqueId,
                OSFramework.Enum.ShapeType.Polyline,
                finalConfigs
            );
        }
    }
}
