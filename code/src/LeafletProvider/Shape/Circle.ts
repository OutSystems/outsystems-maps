/// <reference path="AbstractProviderShape.ts" />

// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace LeafletProvider.Shape {
    export class Circle
        extends AbstractProviderShape<
            Configuration.Shape.CircleShapeConfig,
            L.Circle
        >
        implements OSFramework.Shape.IShapeCircle
    {
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
                new Configuration.Shape.CircleShapeConfig(configs)
            );
        }

        protected get invalidShapeLocationErrorCode(): OSFramework.Enum.ErrorCodes {
            return OSFramework.Enum.ErrorCodes.CFG_InvalidCircleShapeCenter;
        }

        protected get providerObjectListener(): L.Circle {
            return this.provider;
        }

        public get providerCenter(): OSFramework.OSStructures.OSMap.Coordinates {
            const center = this.provider.getLatLng();
            if (center === undefined) {
                OSFramework.Helper.ThrowError(
                    this.map,
                    OSFramework.Enum.ErrorCodes.API_FailedGettingShapeCenter
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
                OSFramework.Helper.ThrowError(
                    this.map,
                    OSFramework.Enum.ErrorCodes.API_FailedGettingShapeRadius
                );
            }

            return center;
        }

        public get shapeTag(): string {
            return OSFramework.Helper.Constants.shapeCircleTag;
        }

        private _buildCenter(
            location: string
        ): Promise<OSFramework.OSStructures.OSMap.Coordinates> {
            // If the Shape doesn't have the minimum valid address/coordinates, then throw an error
            if (OSFramework.Helper.IsEmptyString(location)) {
                OSFramework.Helper.ThrowError(
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
            center: OSFramework.OSStructures.OSMap.Coordinates
        ): L.Circle {
            return new L.Circle(center, this.getProviderConfig());
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
            const propValue = OSFramework.Enum.OS_Config_Shape[propertyName];
            super.changeProperty(propertyName, value);
            if (this.isReady) {
                switch (propValue) {
                    case OSFramework.Enum.OS_Config_Shape.center:
                        // eslint-disable-next-line no-case-declarations
                        const shapeCenter = this._buildCenter(value);
                        // If path is undefined (should be a promise) -> don't create the shape
                        if (shapeCenter !== undefined) {
                            shapeCenter
                                .then((center) => {
                                    this.provider.setLatLng(center);
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
                    case OSFramework.Enum.OS_Config_Shape.radius:
                        this.provider.setRadius(value);
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
    }
}
