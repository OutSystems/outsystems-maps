/// <reference path="AbstractProviderShape.ts" />

// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace GoogleProvider.Shape {
    export class Circle
        extends AbstractProviderShape<
            Configuration.Shape.CircleShapeConfig,
            google.maps.Circle
        >
        implements ICircle {
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
                new Configuration.Shape.CircleShapeConfig(configs)
            );
        }

        private _buildCenter(
            location: string
        ): Promise<OSFramework.OSStructures.OSMap.Coordinates> {
            // If the Shape doesn't have the minimum valid address/coordinates, then throw an error
            if (OSFramework.Helper.IsEmptyString(location)) {
                this.map.mapEvents.trigger(
                    OSFramework.Event.OSMap.MapEventType.OnError,
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
            center: OSFramework.OSStructures.OSMap.Coordinates
        ): google.maps.Circle {
            return new google.maps.Circle({
                map: this.map.provider,
                center,
                ...this.getProviderConfig()
            });
        }

        protected _setProviderPath(): void {
            throw new Error(
                `Set Provider Path method can't be used on a Circle Shape because this type of shape doesn't have a path. 
                Try to set the center or radius instead.`
            );
        }

        public build(): void {
            // First build center coordinates based on the location
            // Then, create the provider (Google maps Shape)
            const shapeCenter = this._buildCenter(this.config.center);
            super._buildProvider(shapeCenter);

            super.build();
        }

        public get shapeTag(): string {
            return OSFramework.Helper.Constants.shapeCircleTag;
        }

        public get invalidShapeLocationErrorCode(): OSFramework.Enum.ErrorCodes {
            return OSFramework.Enum.ErrorCodes.CFG_InvalidCirclehapeLocations;
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
                                    this.provider.setCenter(center);
                                })
                                .catch((error) => {
                                    this.map.mapEvents.trigger(
                                        OSFramework.Event.OSMap.MapEventType
                                            .OnError,
                                        this.map,
                                        OSFramework.Enum.ErrorCodes
                                            .LIB_FailedGeocodingShapeLocations,
                                        `${error}`
                                    );
                                });
                        }
                        return;
                    case OSFramework.Enum.OS_Config_Shape.radius:
                        return this.provider.setRadius(value);
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
