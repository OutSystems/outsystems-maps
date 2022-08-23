/// <reference path="AbstractPolyshape.ts" />

// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace Provider.Maps.Google.Shape {
    export class Polyline
        extends AbstractPolyshape<
            Configuration.Shape.BasicShapeConfig,
            google.maps.Polyline
        >
        implements OSFramework.Maps.Shape.IShapePolyshape
    {
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
                new Configuration.Shape.BasicShapeConfig(configs)
            );
        }

        protected _createProvider(
            path: Array<OSFramework.Maps.OSStructures.OSMap.Coordinates>
        ): google.maps.Polyline {
            return new google.maps.Polyline({
                map: this.map.provider,
                path,
                ...this.getProviderConfig()
            });
        }

        protected get invalidShapeLocationErrorCode(): OSFramework.Maps.Enum.ErrorCodes {
            return OSFramework.Maps.Enum.ErrorCodes
                .CFG_InvalidPolylineShapeLocations;
        }

        public get shapeTag(): string {
            return OSFramework.Maps.Helper.Constants.shapePolylineTag;
        }
    }
}
