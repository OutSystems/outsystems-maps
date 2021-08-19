/// <reference path="AbstractProviderShape.ts" />

// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace GoogleProvider.Shape {
    export abstract class AbstractPolyshape<
        T extends OSFramework.Configuration.IConfigurationShape,
        W extends google.maps.Polygon | google.maps.Polyline
    > extends AbstractProviderShape<T, W> {
        protected _setProviderPath(
            path: Array<OSFramework.OSStructures.OSMap.Coordinates>
        ): void {
            this._provider.setPath(path);
        }

        public get providerPath(): Array<OSFramework.OSStructures.OSMap.Coordinates> {
            const path = this.provider.getPath();
            if (path === undefined) {
                OSFramework.Helper.ThrowError(
                    this.map,
                    OSFramework.Enum.ErrorCodes.API_FailedGettingShapePath
                );
                return [];
            }

            return path
                .getAt(0)
                .getArray()
                .map((coords: google.maps.LatLng) => coords.toJSON());
        }

        public get providerRadius(): number {
            // Throws error unless one of the shapes overrides this method
            OSFramework.Helper.ThrowError(
                this.map,
                OSFramework.Enum.ErrorCodes.API_FailedGettingShapeRadius
            );
            return;
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

        protected abstract _createProvider(
            path: Array<OSFramework.OSStructures.OSMap.Coordinates>
        ): W;

        public abstract get shapeTag(): string;
        public abstract get invalidShapeLocationErrorCode(): OSFramework.Enum.ErrorCodes;
    }
}
