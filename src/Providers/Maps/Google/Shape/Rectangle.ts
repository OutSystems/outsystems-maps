/// <reference path="AbstractProviderShape.ts" />

// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace Provider.Maps.Google.Shape {
    export class Rectangle
        extends AbstractProviderShape<
            Configuration.Shape.RectangleShapeConfig,
            google.maps.Rectangle
        >
        implements OSFramework.Maps.Shape.IShapeRectangle
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
                new Configuration.Shape.RectangleShapeConfig(configs)
            );
        }

        // From the structure Bounds (north, south, east, weast) we need to convert the locations into the correct format of bounds
        // For instance (north: string -> north: number)
        private _buildBounds(
            boundsString: string
        ): Promise<OSFramework.Maps.OSStructures.OSMap.Bounds> {
            const bounds: OSFramework.Maps.OSStructures.OSMap.BoundsString =
                JSON.parse(boundsString);
            // If the Shape doesn't have the minimum valid address/coordinates, then throw an error
            if (OSFramework.Maps.Helper.HasAnyEmptyBound(bounds)) {
                OSFramework.Maps.Helper.ThrowError(
                    this.map,
                    this.invalidShapeLocationErrorCode
                );
                return;
            }

            // make sure the provided bounds (string) have the correct format
            // this method will then return a promise that will be resolved on the _buildProvider
            return this._convertStringToBounds(bounds);
        }

        /** This method will help converting the bounds (string) into the respective coordinates that will be used on the bounds
         * It returns a promise because bounds will get converted into coordinates
         * The method resposible for this conversion (Helper.Conversions.ConvertToCoordinates) also returns a Promise
         * This Promise will only get resolved after the provider gets built (asynchronously)
         */
        private _convertStringToBounds(
            bounds: OSFramework.Maps.OSStructures.OSMap.BoundsString
        ): Promise<OSFramework.Maps.OSStructures.OSMap.Bounds> {
            const cardinalDirections = ['north', 'south', 'east', 'west'];
            return new Promise((resolve, reject) => {
                let boundsLength = 0;
                const newBounds =
                    new OSFramework.Maps.OSStructures.OSMap.Bounds();
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
                        Helper.Conversions.ConvertToCoordinates(bounds[cd])
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

        protected _createProvider(
            bounds: OSFramework.Maps.OSStructures.OSMap.Bounds
        ): google.maps.Rectangle {
            return new google.maps.Rectangle({
                map: this.map.provider,
                bounds: bounds,
                ...(this.getProviderConfig() as Configuration.Shape.IShapeProviderConfig)
            });
        }

        protected getShapeCoordinates(): OSFramework.Maps.OSStructures.OSMap.RectangleCoordinates {
            const bounds = {
                north: this.bounds.north,
                south: this.bounds.south,
                west: this.bounds.west,
                east: this.bounds.east
            };
            return {
                location: bounds,
                coordinates: bounds
            };
        }

        protected get invalidShapeLocationErrorCode(): OSFramework.Maps.Enum.ErrorCodes {
            return OSFramework.Maps.Enum.ErrorCodes
                .CFG_InvalidRectangleShapeBounds;
        }

        public get bounds(): OSFramework.Maps.OSStructures.OSMap.Bounds {
            const providerBounds = this.providerBounds;
            const bounds = new OSFramework.Maps.OSStructures.OSMap.Bounds();

            // Map providerBounds into OSFramework bounds structure
            bounds.east = providerBounds.getNorthEast().lng();
            bounds.north = providerBounds.getNorthEast().lat();
            bounds.west = providerBounds.getSouthWest().lng();
            bounds.south = providerBounds.getSouthWest().lat();
            return bounds;
        }

        public get providerBounds(): google.maps.LatLngBounds {
            return this.provider.getBounds();
        }

        public get providerEventsList(): Array<string> {
            return Constants.Shape.ProviderRectangleEvents;
        }

        public get providerObjectListener(): google.maps.Rectangle {
            return this.provider;
        }

        public get shapeTag(): string {
            return OSFramework.Maps.Helper.Constants.shapeRectangleTag;
        }

        public build(): void {
            super.build();

            // First build the bounds with the coordinates
            // Then, create the provider (Google maps Shape)
            const bounds = this._buildBounds(this.config.bounds);
            super._buildProvider(bounds);
        }

        public changeProperty(
            propertyName: string,
            propertyValue: unknown
        ): void {
            const propValue =
                OSFramework.Maps.Enum.OS_Config_Shape[propertyName];
            super.changeProperty(propertyName, propertyValue);
            if (this.isReady) {
                switch (propValue) {
                    case OSFramework.Maps.Enum.OS_Config_Shape.fillColor:
                    case OSFramework.Maps.Enum.OS_Config_Shape.fillOpacity:
                        return this.provider.set(propertyName, propertyValue);
                    case OSFramework.Maps.Enum.OS_Config_Shape.bounds:
                        // eslint-disable-next-line no-case-declarations
                        const shapeBounds = this._buildBounds(
                            propertyValue as string
                        );
                        // If path is undefined (should be a promise) -> don't create the shape
                        if (shapeBounds !== undefined) {
                            shapeBounds
                                .then((bounds) => {
                                    this.provider.setBounds(bounds);
                                })
                                .catch((error) => {
                                    OSFramework.Maps.Helper.ThrowError(
                                        this.map,
                                        OSFramework.Maps.Enum.ErrorCodes
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
