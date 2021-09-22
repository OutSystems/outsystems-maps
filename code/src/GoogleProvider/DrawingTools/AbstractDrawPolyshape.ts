/// <reference path="AbstractDrawShape.ts" />

// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace GoogleProvider.DrawingTools {
    export abstract class AbstractDrawPolyshape<
        W extends
            | Configuration.DrawingTools.DrawBasicShapeConfig
            | Configuration.DrawingTools.DrawFilledShapeConfig
    > extends AbstractDrawShape<W> {
        constructor(
            map: OSFramework.OSMap.IMap,
            drawingTools: OSFramework.DrawingTools.IDrawingTools,
            drawingToolsId: string,
            type: string,
            // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
            configs: any
        ) {
            super(map, drawingTools, drawingToolsId, type, configs);
        }

        /** Adds the location to the configurations of the new shape (polyline or polygon) */
        protected createConfigsElement(
            // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
            shape: google.maps.Polyline | google.maps.Polygon,
            configs:
                | Configuration.Shape.BasicShapeConfig
                | Configuration.Shape.FilledShapeConfig
        ):
            | Configuration.Shape.BasicShapeConfig
            | Configuration.Shape.FilledShapeConfig {
            const locations = shape
                .getPath()
                .getArray()
                .map((elm) => `${elm.lat()},${elm.lng()}`);

            // Join both the configs that were provided for the new shape element and the location that was provided by the DrawingTools shapecomplete event
            const finalConfigs = {
                ...configs,
                locations: JSON.stringify(locations)
            };
            return finalConfigs as
                | Configuration.Shape.BasicShapeConfig
                | Configuration.Shape.FilledShapeConfig;
        }
    }
}