/// <reference path="AbstractProviderShape.ts" />

// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace GoogleProvider.Shape {
    export class Rectangle
        extends AbstractProviderShape<
            Configuration.Shape.RectangleShapeConfig,
            google.maps.Rectangle
        >
        implements OSFramework.Shape.IShapeRectangle {
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
                new Configuration.Shape.RectangleShapeConfig(configs)
            );
        }

        // From the structure Bounds (north, south, east, weast) we need to convert the locations into the correct format of bounds
        // For instance (north: string -> north: number)
        private _buildBounds(
            boundsString: string
        ): Promise<OSFramework.OSStructures.OSMap.Bounds> {
            const bounds: OSFramework.OSStructures.OSMap.BoundsString = JSON.parse(
                boundsString
            );
            // If the Shape doesn't have the minimum valid address/coordinates, then throw an error
            if (this._isEmptyBounds(bounds)) {
                OSFramework.Helper.ThrowError(
                    this.map,
                    this.invalidShapeLocationErrorCode
                );
                return;
            }

            return this._convertStringToBounds(bounds);
        }

        private _convertStringToBounds(
            bounds: OSFramework.OSStructures.OSMap.BoundsString
        ): Promise<OSFramework.OSStructures.OSMap.Bounds> {
            const cardinalDirections = ['north', 'south', 'east', 'west'];
            return new Promise((resolve, reject) => {
                let boundsLength = 0;
                const newBounds = new OSFramework.OSStructures.OSMap.Bounds();
                cardinalDirections.forEach((cd) => {
                    // Regex that validates if string is a coordinate (latitude or longitude)
                    const regexValidator = /^-{0,1}\d*\.{0,1}\d*$/;
                    if (regexValidator.test(bounds[cd])) {
                        boundsLength++;
                        newBounds[cd] = parseFloat(bounds[cd]);
                        if (boundsLength === 4) {
                            resolve(newBounds);
                        }
                    } else {
                        Helper.Conversions.ConvertToCoordinates(
                            bounds[cd],
                            this.map.config.apiKey
                        )
                            .then((response) => {
                                boundsLength++;
                                switch (cd) {
                                    case 'north':
                                    case 'south':
                                        newBounds[cd] = response.lat;
                                        break;
                                    case 'east':
                                    case 'west':
                                    default:
                                        newBounds[cd] = response.lng;
                                        break;
                                }
                                if (boundsLength === 4) {
                                    resolve(newBounds);
                                }
                            })
                            .catch((e) => reject(e));
                    }
                });
            });
        }

        /** Check if any of the bounds (north, south, east or west) is empty. If one or more are empty, then return True */
        private _isEmptyBounds(
            location: OSFramework.OSStructures.OSMap.BoundsString
        ): boolean {
            return (
                OSFramework.Helper.IsEmptyString(location.north) ||
                OSFramework.Helper.IsEmptyString(location.south) ||
                OSFramework.Helper.IsEmptyString(location.east) ||
                OSFramework.Helper.IsEmptyString(location.west)
            );
        }

        protected _createProvider(
            bounds: OSFramework.OSStructures.OSMap.Bounds
        ): google.maps.Rectangle {
            return new google.maps.Rectangle({
                map: this.map.provider,
                bounds,
                ...this.getProviderConfig()
            });
        }

        public get bounds(): OSFramework.OSStructures.OSMap.Bounds {
            const providerBounds: google.maps.LatLngBounds = this.provider.getBounds();
            const bounds = new OSFramework.OSStructures.OSMap.Bounds();

            // Map providerBounds into OSFramework bounds structure
            bounds.east = providerBounds.getNorthEast().lat();
            bounds.north = providerBounds.getNorthEast().lng();
            bounds.west = providerBounds.getSouthWest().lat();
            bounds.south = providerBounds.getSouthWest().lng();
            return bounds;
        }

        public get invalidShapeLocationErrorCode(): OSFramework.Enum.ErrorCodes {
            return OSFramework.Enum.ErrorCodes.CFG_InvalidRectangleShapeCenter;
        }

        public get shapeTag(): string {
            return OSFramework.Helper.Constants.shapeRectangleTag;
        }

        public build(): void {
            super.build();

            // First build center coordinates based on the location
            // Then, create the provider (Google maps Shape)
            const bounds = this._buildBounds(this.config.bounds);
            super._buildProvider(bounds);
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
                    case OSFramework.Enum.OS_Config_Shape.bounds:
                        // eslint-disable-next-line no-case-declarations
                        const shapeBounds = this._buildBounds(value);
                        // If path is undefined (should be a promise) -> don't create the shape
                        if (shapeBounds !== undefined) {
                            shapeBounds
                                .then((bounds) => {
                                    this.provider.setBounds(bounds);
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
                }
            }
        }
    }
}
