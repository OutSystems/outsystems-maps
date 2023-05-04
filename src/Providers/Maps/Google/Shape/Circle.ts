/// <reference path="AbstractProviderShape.ts" />

// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace Provider.Maps.Google.Shape {
    export class Circle
        extends AbstractProviderShape<
            Configuration.Shape.CircleShapeConfig,
            google.maps.Circle
        >
        implements OSFramework.Maps.Shape.IShapeCircle
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
                new Configuration.Shape.CircleShapeConfig(configs)
            );
        }

        private _buildCenter(
            location: string
        ): Promise<OSFramework.Maps.OSStructures.OSMap.Coordinates> {
            // If the Shape doesn't have the minimum valid address/coordinates, then throw an error
            if (OSFramework.Maps.Helper.IsEmptyString(location)) {
                OSFramework.Maps.Helper.ThrowError(
                    this.map,
                    this.invalidShapeLocationErrorCode
                );
                return;
            }

            return new Promise((resolve, reject) => {
                Helper.Conversions.ConvertToCoordinates(
                    location,
                    this.map.config.apiKey
                )
                    .then((response) => {
                        const coordinates = {
                            lat: response.lat,
                            lng: response.lng
                        };
                        resolve(coordinates);
                    })
                    .catch((e) => reject(e));
            });
        }

        protected _createProvider(
            center: OSFramework.Maps.OSStructures.OSMap.Coordinates
        ): google.maps.Circle {
            return new google.maps.Circle({
                map: this.map.provider,
                center,
                ...this.getProviderConfig()
            });
        }

        protected get invalidShapeLocationErrorCode(): OSFramework.Maps.Enum.ErrorCodes {
            return OSFramework.Maps.Enum.ErrorCodes
                .CFG_InvalidCircleShapeCenter;
        }

        protected getShapeProperties() {
            return {
                coordinates: {
                    Lat: this.providerCenter.lat,
                    Lng: this.providerCenter.lng
                },
                location: {
                    location: `${this.providerCenter.lat.toString()},${this.providerCenter.lng.toString()}`,
                    radius: this.providerRadius
                }
            };
        }

        public get providerCenter(): OSFramework.Maps.OSStructures.OSMap.Coordinates {
            const center = this.provider.get('center');
            if (center === undefined) {
                OSFramework.Maps.Helper.ThrowError(
                    this.map,
                    OSFramework.Maps.Enum.ErrorCodes
                        .API_FailedGettingShapeCenter
                );
            }

            return center.toJSON();
        }

        public get providerEventsList(): Array<string> {
            return Constants.Shape.ProviderCircleEvents;
        }

        public get providerObjectListener(): google.maps.Circle {
            return this.provider;
        }

        public get providerRadius(): number {
            const center = this.provider.get('radius');
            if (center === undefined) {
                OSFramework.Maps.Helper.ThrowError(
                    this.map,
                    OSFramework.Maps.Enum.ErrorCodes
                        .API_FailedGettingShapeRadius
                );
            }

            return center;
        }

        public get shapeTag(): string {
            return OSFramework.Maps.Helper.Constants.shapeCircleTag;
        }

        public build(): void {
            super.build();
            // First build center coordinates based on the location
            // Then, create the provider (Google maps Shape)
            const shapeCenter = this._buildCenter(this.config.center);
            super._buildProvider(shapeCenter);
        }

        // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
        public changeProperty(propertyName: string, value: any): void {
            const propValue =
                OSFramework.Maps.Enum.OS_Config_Shape[propertyName];
            super.changeProperty(propertyName, value);
            if (this.isReady) {
                switch (propValue) {
                    case OSFramework.Maps.Enum.OS_Config_Shape.center:
                        // eslint-disable-next-line no-case-declarations
                        const shapeCenter = this._buildCenter(value);
                        // If path is undefined (should be a promise) -> don't create the shape
                        if (shapeCenter !== undefined) {
                            shapeCenter
                                .then((center) => {
                                    this.provider.setCenter(center);
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
                    case OSFramework.Maps.Enum.OS_Config_Shape.radius:
                        return this.provider.setRadius(value);
                    case OSFramework.Maps.Enum.OS_Config_Shape.fillColor:
                    case OSFramework.Maps.Enum.OS_Config_Shape.fillOpacity:
                        return this.provider.set(propertyName, value);
                }
            }
        }
    }
}
