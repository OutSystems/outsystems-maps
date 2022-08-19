/// <reference path="AbstractPolyshape.ts" />

// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace Provider.Leaflet.Shape {
    export class Polygon extends AbstractPolyshape<
        Configuration.Shape.FilledShapeConfig,
        L.Polygon
    > {
        constructor(
            map: OSFramework.Maps.OSMap.IMap,
            shapeId: string,
            type: OSFramework.Maps.Enum.ShapeType,
            configs: JSON
        ) {
            super(
                map,
                shapeId,
                type,
                new Configuration.Shape.FilledShapeConfig(configs)
            );
        }

        protected get invalidShapeLocationErrorCode(): OSFramework.Maps.Enum.ErrorCodes {
            return OSFramework.Maps.Enum.ErrorCodes
                .CFG_InvalidPolygonShapeLocations;
        }

        protected get providerObjectPath():
            | L.LatLng
            | L.LatLng[]
            | L.LatLng[][]
            | L.LatLng[][][] {
            // We need to get the first position of the Array because here the latLngs are inside an
            return this.provider.getLatLngs()[0];
        }

        public get shapeTag(): string {
            return OSFramework.Maps.Helper.Constants.shapePolygonTag;
        }

        protected createProvider(
            path: Array<OSFramework.Maps.OSStructures.OSMap.Coordinates>
        ): L.Polygon {
            return new L.Polygon(path, this.getProviderConfig());
        }
    }
}
