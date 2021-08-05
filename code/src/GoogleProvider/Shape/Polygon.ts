/// <reference path="AbstractProviderShape.ts" />

// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace GoogleProvider.Shape {
    export class Polygon
        extends AbstractProviderShape<
            Configuration.Shape.FilledShapeConfig,
            google.maps.Polygon
        >
        implements IPolygon {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any

        constructor(
            map: OSFramework.OSMap.IMap,
            shapeId: string,
            type: OSFramework.Enum.ShapeType,
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
            path: Array<OSFramework.OSStructures.OSMap.Coordinates>
        ): google.maps.Polygon {
            return new google.maps.Polygon({
                map: this.map.provider,
                path,
                ...this.getProviderConfig()
            });
        }

        protected _setProviderPath(
            path: Array<OSFramework.OSStructures.OSMap.Coordinates>
        ): void {
            this._provider.setPath(path);
        }

        public get shapeTag(): string {
            return OSFramework.Helper.Constants.shapePolygonTag;
        }

        public get invalidShapeLocationErrorCode(): OSFramework.Enum.ErrorCodes {
            return OSFramework.Enum.ErrorCodes.CFG_InvalidPolygonShapeLocations;
        }

        // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
        public changeProperty(propertyName: string, value: any): void {
            const propValue = OSFramework.Enum.OS_Config_Shape[propertyName];
            super.changeProperty(propertyName, value);
            if (this.isReady) {
                switch (propValue) {
                    case OSFramework.Enum.OS_Config_Shape.fillColor:
                    case OSFramework.Enum.OS_Config_Shape.fillOpacity:
                        return this.provider.set(propertyName, value);
                    default:
                        super.changeProperty(propertyName, value);
                }
            }
        }
    }
}
