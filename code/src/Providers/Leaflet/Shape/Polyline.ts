/// <reference path="AbstractPolyshape.ts" />

// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace Provider.Leaflet.Shape {
    export class Polyline extends AbstractPolyshape<
        Configuration.Shape.BasicShapeConfig,
        L.Polyline
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
                new Configuration.Shape.BasicShapeConfig(configs)
            );
        }

        protected get invalidShapeLocationErrorCode(): OSFramework.Enum.ErrorCodes {
            return OSFramework.Enum.ErrorCodes
                .CFG_InvalidPolylineShapeLocations;
        }

        protected get providerObjectPath():
            | L.LatLng[]
            | L.LatLng[][]
            | L.LatLng[][][] {
            return this.provider.getLatLngs();
        }

        public get shapeTag(): string {
            return OSFramework.Helper.Constants.shapePolylineTag;
        }

        protected createProvider(
            path: Array<OSFramework.OSStructures.OSMap.Coordinates>
        ): L.Polyline {
            return new L.Polyline(path, this.getProviderConfig());
        }
    }
}
