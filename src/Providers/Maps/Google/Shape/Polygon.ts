/// <reference path="AbstractPolyshape.ts" />

// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace Provider.Maps.Google.Shape {
    export class Polygon
        extends AbstractPolyshape<
            Configuration.Shape.FilledShapeConfig,
            google.maps.Polygon
        >
        implements OSFramework.Maps.Shape.IShapePolyshape
    {
        constructor(
            map: OSFramework.Maps.OSMap.IMap,
            shapeId: string,
            type: OSFramework.Maps.Enum.ShapeType,
            configs: unknown
        ) {
            super(
                map,
                shapeId,
                type,
                new Configuration.Shape.FilledShapeConfig(configs)
            );
        }

        protected _createProvider(
            path: Array<OSFramework.Maps.OSStructures.OSMap.Coordinates>
        ): google.maps.Polygon {
            return new google.maps.Polygon({
                map: this.map.provider,
                paths: path,
                ...(this.getProviderConfig() as Configuration.Shape.IShapeProviderConfig)
            });
        }

        protected getShapeCoordinates(): OSFramework.Maps.OSStructures.OSMap.PolylineCoordinates {
            const locations = this.providerObjectPath
                .getArray()
                .map((elm) => `${elm.lat()},${elm.lng()}`);
            const coordinates = this.providerObjectPath
                .getArray()
                .map((elm) => {
                    return {
                        Lat: elm.lat(),
                        Lng: elm.lng()
                    };
                });
            return {
                location: locations,
                coordinates: coordinates
            };
        }

        protected get invalidShapeLocationErrorCode(): OSFramework.Maps.Enum.ErrorCodes {
            return OSFramework.Maps.Enum.ErrorCodes
                .CFG_InvalidPolygonShapeLocations;
        }

        protected get providerObjectPath(): google.maps.MVCArray<google.maps.LatLng> {
            // We need to get the first position of the Array because here the latLngs are inside an
            return this.provider.getPath();
        }

        public get shapeTag(): string {
            return OSFramework.Maps.Helper.Constants.shapePolygonTag;
        }
    }
}
