/// <reference path="AbstractPolyshape.ts" />

// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace LeafletProvider.Shape {
    export class Polygon extends AbstractPolyshape<
        Configuration.Shape.FilledShapeConfig,
        L.Polygon
    > {
        constructor(
            map: OSFramework.OSMap.IMap,
            shapeId: string,
            type: OSFramework.Enum.ShapeType,
            configs: JSON
        ) {
            super(
                map,
                shapeId,
                type,
                new Configuration.Shape.FilledShapeConfig(configs)
            );
        }

        protected get invalidShapeLocationErrorCode(): OSFramework.Enum.ErrorCodes {
            return OSFramework.Enum.ErrorCodes.CFG_InvalidPolygonShapeLocations;
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
            return OSFramework.Helper.Constants.shapePolygonTag;
        }

        protected createProvider(
            path: Array<OSFramework.OSStructures.OSMap.Coordinates>
        ): L.Polygon {
            return new L.Polygon(path, this.getProviderConfig());
        }
    }
}
