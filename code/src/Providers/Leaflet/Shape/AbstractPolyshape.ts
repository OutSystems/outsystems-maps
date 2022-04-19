/// <reference path="AbstractProviderShape.ts" />

// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace Provider.Leaflet.Shape {
    export abstract class AbstractPolyshape<
            T extends OSFramework.Configuration.IConfigurationShape,
            W extends L.Polygon | L.Polyline
        >
        extends AbstractProviderShape<T, W>
        implements OSFramework.Shape.IShapePolyshape
    {
        public get providerEventsList(): Array<string> {
            return Constants.Shape.ProviderPolyshapeEvents;
        }

        public get providerPath(): L.LatLng[] {
            const path = this.providerObjectPath;
            if (path === undefined) {
                OSFramework.Helper.ThrowError(
                    this.map,
                    OSFramework.Enum.ErrorCodes.API_FailedGettingShapePath
                );
                return [];
            }

            return path as L.LatLng[];
        }

        /** Builds the path from a set of multiple locations (string format) */
        private _buildPath(
            loc: string
        ): Promise<Array<OSFramework.OSStructures.OSMap.Coordinates>> {
            // If the Shape doesn't have the minimum valid address/coordinates, then throw an error
            if (this._validateLocations(loc)) {
                const _locations = JSON.parse(loc);
                // Let's return a promise that will be resolved or rejected according to the result
                return new Promise((resolve, reject) => {
                    const shapePath: Map<
                        number,
                        OSFramework.OSStructures.OSMap.Coordinates
                    > = new Map();

                    // As soon as one location from the locations input is not valid:
                    // Is not a string / Is empty
                    // Throw an error for invalid Locations
                    _locations.every((location: string, index: number) => {
                        // Make sure the current location from the array of locations is not empty
                        if (OSFramework.Helper.IsEmptyString(location)) {
                            OSFramework.Helper.ThrowError(
                                this.map,
                                this.invalidShapeLocationErrorCode
                            );
                            return false;
                        }

                        Helper.Conversions.ValidateCoordinates(location)
                            .then((response) => {
                                shapePath.set(index, {
                                    lat: response.lat,
                                    lng: response.lng
                                });
                                if (shapePath.size === _locations.length) {
                                    resolve(
                                        // This method is async
                                        // We need to make sure the path is sorted correctly when all coordinates are retrieved
                                        Array.from(shapePath.keys())
                                            .sort((a, b) => a - b)
                                            .map((key) => shapePath.get(key))
                                    );
                                }
                            })
                            .catch((e) => reject(e));
                        return true;
                    });
                });
            }
        }

        /** Set the provider path from an array of coordinates */
        private _setProviderPath(
            path: Array<OSFramework.OSStructures.OSMap.Coordinates>
        ): void {
            this._provider.setLatLngs(path);
        }

        /** Validates if the locations are accepted for the Shape's path considering the minimum valid address/coordinates */
        private _validateLocations(loc: string): boolean {
            if (
                OSFramework.Helper.IsEmptyString(loc) ||
                JSON.parse(loc).length < this.minPath
            ) {
                OSFramework.Helper.ThrowError(
                    this.map,
                    this.invalidShapeLocationErrorCode
                );
                return false;
            }
            return true;
        }

        public build(): void {
            super.build();

            // Before creating the provider we need to first set the shape path
            const shapePath = this._buildPath(this.config.locations);
            this.buildProvider(shapePath);
        }

        // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
        public changeProperty(propertyName: string, value: any): void {
            const propValue = OSFramework.Enum.OS_Config_Shape[propertyName];
            super.changeProperty(propertyName, value);
            if (this.isReady) {
                switch (propValue) {
                    case OSFramework.Enum.OS_Config_Shape.locations:
                        // eslint-disable-next-line no-case-declarations
                        const shapePath = this._buildPath(value);
                        // If path is undefined (should be a promise) -> don't create the shape
                        if (shapePath !== undefined) {
                            shapePath
                                .then((path) => {
                                    this._setProviderPath(path);
                                })
                                .catch((error) => {
                                    OSFramework.Helper.ThrowError(
                                        this.map,
                                        OSFramework.Enum.ErrorCodes
                                            .LIB_FailedGeocodingShapeLocations,
                                        error
                                    );
                                });
                        }
                        return;
                    case OSFramework.Enum.OS_Config_Shape.fillColor:
                        this.provider.setStyle({ fillColor: value });
                        return;
                    case OSFramework.Enum.OS_Config_Shape.fillOpacity:
                        this.provider.setStyle({ fillOpacity: value });
                        return;
                }
            }
        }

        protected abstract createProvider(
            path: Array<OSFramework.OSStructures.OSMap.Coordinates>
        ): W;

        /** Get the provider path */
        protected abstract get providerObjectPath():
            | L.LatLng
            | L.LatLng[]
            | L.LatLng[][]
            | L.LatLng[][][];

        public abstract get shapeTag(): string;
    }
}
