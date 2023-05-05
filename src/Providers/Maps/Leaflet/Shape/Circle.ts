/// <reference path="AbstractProviderShape.ts" />

// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace Provider.Maps.Leaflet.Shape {
    export class Circle
        extends AbstractProviderShape<
            Configuration.Shape.CircleShapeConfig,
            L.Circle
        >
        implements OSFramework.Maps.Shape.IShapeCircle
    {
        constructor(
            map: OSFramework.Maps.OSMap.IMap,
            shapeId: string,
            type: OSFramework.Maps.Enum.ShapeType,
            configs: JSON
        ) {
            super(
                map,
                shapeId,
                type,
                new Configuration.Shape.CircleShapeConfig(configs)
            );
        }

        protected get invalidShapeLocationErrorCode(): OSFramework.Maps.Enum.ErrorCodes {
            return OSFramework.Maps.Enum.ErrorCodes
                .CFG_InvalidCircleShapeCenter;
        }

        protected get providerObjectListener(): L.Circle {
            return this.provider;
        }

        public get providerCenter(): OSFramework.Maps.OSStructures.OSMap.Coordinates {
            const center = this.provider.getLatLng();
            if (center === undefined) {
                OSFramework.Maps.Helper.ThrowError(
                    this.map,
                    OSFramework.Maps.Enum.ErrorCodes
                        .API_FailedGettingShapeCenter
                );
            }

            return center;
        }

        public get providerEventsList(): Array<string> {
            return Constants.Shape.ProviderCircleEvents;
        }

        public get providerRadius(): number {
            const center = this.provider.getRadius();
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
                Helper.Conversions.ValidateCoordinates(location)
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

        protected createProvider(
            center: OSFramework.Maps.OSStructures.OSMap.Coordinates
        ): L.Circle {
            return new L.Circle(center, this.getProviderConfig());
        }

        protected getShapeProperties(): {
            coordinates: OSFramework.Maps.OSStructures.OSMap.OSCoordinates;
            location: {
                location: string;
                radius: number;
            };
        } {
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

        public build(): void {
            super.build();
            // First build center coordinates based on the location
            // Then, create the provider (Leaflet Shape)
            const shapeCenter = this._buildCenter(this.config.center);
            super.buildProvider(shapeCenter);
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
                                    this.provider.setLatLng(center);
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
                        this.provider.setRadius(value);
                        return;
                    case OSFramework.Maps.Enum.OS_Config_Shape.fillColor:
                        this.provider.setStyle({ fillColor: value });
                        return;
                    case OSFramework.Maps.Enum.OS_Config_Shape.fillOpacity:
                        this.provider.setStyle({ fillOpacity: value });
                        return;
                }
            }
        }
    }
}
