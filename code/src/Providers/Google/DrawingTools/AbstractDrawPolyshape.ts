/// <reference path="AbstractDrawShape.ts" />

// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace Provider.Google.DrawingTools {
    export abstract class AbstractDrawPolyshape<
        W extends
            | Configuration.DrawingTools.DrawBasicShapeConfig
            | Configuration.DrawingTools.DrawFilledShapeConfig
    > extends AbstractDrawShape<W> {
        private _locations: string[];
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
            shape: google.maps.Polyline | google.maps.Polygon,
            configs:
                | Configuration.Shape.BasicShapeConfig
                | Configuration.Shape.FilledShapeConfig
        ):
            | Configuration.Shape.BasicShapeConfig
            | Configuration.Shape.FilledShapeConfig {
            this._locations = shape
                .getPath()
                .getArray()
                .map((elm) => `${elm.lat()},${elm.lng()}`);

            // Join both the configs that were provided for the new shape element and the location that was provided by the DrawingTools shapecomplete event
            const finalConfigs = {
                ...configs,
                locations: JSON.stringify(this._locations)
            };
            return finalConfigs as
                | Configuration.Shape.BasicShapeConfig
                | Configuration.Shape.FilledShapeConfig;
        }

        /** Gets the coordinates of the new shape (polyline or polygon), with the expected lat/lng structure */
        protected getCoordinates(): string {
            const locations = JSON.parse(this.newElm.config.locations);
            const locationsArray = [];

            for (const coord of locations) {
                locationsArray.push(coord.toString().split(','));
            }

            const finalLocations = locationsArray.map(
                (coords: OSFramework.OSStructures.OSMap.Coordinates) => {
                    return { Lat: coords[0], Lng: coords[1] };
                }
            );

            return JSON.stringify(finalLocations);
        }

        /** Gets the location of the new shape (polyline or polygon), as a string */
        protected getLocation(): string {
            return JSON.stringify(this._locations);
        }
    }
}
