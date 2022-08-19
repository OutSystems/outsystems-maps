/// <reference path="AbstractProviderShape.ts" />

// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace Provider.Leaflet.Shape {
    export class Rectangle
        extends AbstractProviderShape<
            Configuration.Shape.RectangleShapeConfig,
            L.Rectangle
        >
        implements OSFramework.Shape.IShapeRectangle
    {
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

        protected get invalidShapeLocationErrorCode(): OSFramework.Enum.ErrorCodes {
            return OSFramework.Enum.ErrorCodes.CFG_InvalidRectangleShapeBounds;
        }

        public get bounds(): OSFramework.OSStructures.OSMap.Bounds {
            const providerBounds: L.LatLngBounds = this.provider.getBounds();
            const bounds = new OSFramework.OSStructures.OSMap.Bounds();

            // Map providerBounds into OSFramework bounds structure
            bounds.east = providerBounds.getNorthEast().lng;
            bounds.north = providerBounds.getNorthEast().lat;
            bounds.west = providerBounds.getSouthWest().lng;
            bounds.south = providerBounds.getSouthWest().lat;
            return bounds;
        }

        public get providerEventsList(): Array<string> {
            return Constants.Shape.ProviderRectangleEvents;
        }

        public get shapeTag(): string {
            return OSFramework.Helper.Constants.shapeRectangleTag;
        }

        // From the structure Bounds (north, south, east, weast) we need to convert the locations into the correct format of bounds
        // For instance (north: string -> north: number)
        private _buildBounds(
            boundsString: string
        ): Promise<OSFramework.OSStructures.OSMap.Bounds> {
            const bounds: OSFramework.OSStructures.OSMap.BoundsString =
                JSON.parse(boundsString);
            // If the Shape doesn't have the minimum valid address/coordinates, then throw an error
            if (OSFramework.Helper.HasAnyEmptyBound(bounds)) {
                OSFramework.Helper.ThrowError(
                    this.map,
                    this.invalidShapeLocationErrorCode
                );
                return;
            }

            // make sure the provided bounds (string) have the correct format
            // this method will then return a promise that will be resolved on the _buildProvider
            return this._convertStringToBounds(bounds);
        }

        /**
         * This method will help converting the bounds (string) into the respective coordinates that will be used on the bounds
         * It returns a promise because bounds will get converted into coordinates
         * The method resposible for this conversion (Helper.Conversions.ValidateCoordinates) also returns a Promise
         * This Promise will only get resolved after the provider gets built (asynchronously)
         */
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
                        Helper.Conversions.ValidateCoordinates(bounds[cd])
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

        protected createProvider(
            bounds: OSFramework.OSStructures.OSMap.Bounds
        ): L.Rectangle {
            const providerBounds: L.LatLngBoundsExpression = [
                [bounds.south, bounds.west],
                [bounds.north, bounds.east]
            ];
            return new L.Rectangle(providerBounds, {
                ...this.getProviderConfig()
            });
        }

        public build(): void {
            super.build();

            // First build the bounds with the coordinates
            // Then, create the provider (Leaflet Shape)
            const bounds = this._buildBounds(this.config.bounds);
            super.buildProvider(bounds);
        }

        // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
        public changeProperty(propertyName: string, value: any): void {
            const propValue = OSFramework.Enum.OS_Config_Shape[propertyName];
            super.changeProperty(propertyName, value);
            if (this.isReady) {
                switch (propValue) {
                    case OSFramework.Enum.OS_Config_Shape.fillColor:
                        this.provider.setStyle({ fillColor: value });
                        return;
                    case OSFramework.Enum.OS_Config_Shape.fillOpacity:
                        this.provider.setStyle({ fillOpacity: value });
                        return;
                    case OSFramework.Enum.OS_Config_Shape.bounds:
                        // eslint-disable-next-line no-case-declarations
                        const shapeBounds = this._buildBounds(value);
                        // If path is undefined (should be a promise) -> don't create the shape
                        if (shapeBounds !== undefined) {
                            shapeBounds
                                .then((bounds) => {
                                    const providerBounds: L.LatLngBoundsExpression =
                                        [
                                            [bounds.south, bounds.west],
                                            [bounds.north, bounds.east]
                                        ];
                                    this.provider.setBounds(providerBounds);
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
