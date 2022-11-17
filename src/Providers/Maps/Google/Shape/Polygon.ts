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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any

        constructor(
            map: OSFramework.Maps.OSMap.IMap,
            shapeId: string,
            type: OSFramework.Maps.Enum.ShapeType,
            // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
            configs: any
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
                path,
                ...this.getProviderConfig()
            });
        }

        protected get invalidShapeLocationErrorCode(): OSFramework.Maps.Enum.ErrorCodes {
            return OSFramework.Maps.Enum.ErrorCodes
                .CFG_InvalidPolygonShapeLocations;
        }

        public get shapeTag(): string {
            return OSFramework.Maps.Helper.Constants.shapePolygonTag;
        }
    }
}
