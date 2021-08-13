/// <reference path="../../OSFramework/Shape/AbstractShape.ts" />

// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace GoogleProvider.Shape {
    export abstract class AbstractProviderShape<
        T extends OSFramework.Configuration.IConfigurationShape,
        W extends google.maps.MVCObject
    > extends OSFramework.Shape.AbstractShape<T> {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        private _listeners: Array<string>;
        protected _provider: W;

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

                        Helper.Conversions.ConvertToCoordinates(
                            location,
                            this.map.config.apiKey
                        )
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

        private _setShapeEvents(): void {
            if (this._listeners === undefined) this._listeners = [];
            // Make sure the listeners get removed before adding the new ones
            this._listeners.forEach((eventListener, index) => {
                google.maps.event.clearListeners(this.provider, eventListener);
                this._listeners.splice(index, 1);
            });

            // OnClick Event
            if (
                this.shapeEvents.hasHandlers(
                    OSFramework.Event.Shape.ShapeEventType.OnClick
                ) &&
                this.provider.get('clickable') // Always true. Fallback in case this parameter gets changed in the future.
            ) {
                this.provider.addListener('click', () => {
                    this.shapeEvents.trigger(
                        OSFramework.Event.Shape.ShapeEventType.OnClick
                    );
                });
            }

            // Any events that got added to the shapeEvents via the API Subscribe method will have to be taken care here
            // If the Event type of each handler is ShapeProviderEvent, we want to make sure to add that event to the listeners of the google shape provider (e.g. dblclick, dragend, etc)
            // Otherwise, we don't want to add them to the google provider listeners (e.g. OnInitialize, OnClick, etc)
            this.shapeEvents.handlers.forEach(
                (handler: OSFramework.Event.IEvent<string>, eventName) => {
                    if (
                        handler instanceof
                        OSFramework.Event.Shape.ShapeProviderEvent
                    ) {
                        this._listeners.push(eventName);
                        this.provider.addListener(
                            // Name of the event (e.g. dblclick, dragend, etc)
                            eventName,
                            () => {
                                this.shapeEvents.trigger(
                                    // EventType
                                    OSFramework.Event.Shape.ShapeEventType
                                        .ProviderEvent,
                                    // EventName
                                    eventName
                                );
                            }
                        );
                    }
                }
            );
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

        /** Builds the provider (asynchronously) by receving a set of multiple coordinates (creating a path for the shape) or just one (creating the center of the shape) */
        protected _buildProvider(
            coordinates:
                | Promise<OSFramework.OSStructures.OSMap.Coordinates>
                | Promise<Array<OSFramework.OSStructures.OSMap.Coordinates>>
        ): void {
            // First build coords from locations
            // Then, create the provider (Google maps Shape)
            // Finally, set Shape events

            // If coords is undefined (should be a promise) -> don't create the shape
            if (coordinates !== undefined) {
                coordinates
                    .then((coords) => {
                        // Create the provider with the respective coords
                        this._provider = this._createProvider(coords);

                        // We can only set the events on the provider after its creation
                        this._setShapeEvents();

                        // Finish build of Shape
                        this.finishBuild();
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
        }

        /** Checks if the Shape has associated events */
        public get hasEvents(): boolean {
            return this.shapeEvents !== undefined;
        }

        public get provider(): W {
            return this._provider;
        }

        public get providerEvents(): Array<string> {
            return Constants.Shape.Events;
        }

        public get providerPath(): Array<OSFramework.OSStructures.OSMap.Coordinates> {
            // Same as getPath()
            const path = this.provider.get('latLngs');
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

        public get providerCenter(): OSFramework.OSStructures.OSMap.Coordinates {
            // Throws error unless one of the shapes overrides this method
            OSFramework.Helper.ThrowError(
                this.map,
                OSFramework.Enum.ErrorCodes.API_FailedGettingShapeCenter
            );
            return;
        }

        public get providerRadius(): number {
            // Throws error unless one of the shapes overrides this method
            OSFramework.Helper.ThrowError(
                this.map,
                OSFramework.Enum.ErrorCodes.API_FailedGettingShapeRadius
            );
            return;
        }

        public build(): void {
            super.build();

            // Only if the provider has not been defined by any child (e.g. Circle shape) we want to create the provider by using the default and generic builder
            if (this.provider === undefined) {
                const shapePath = this._buildPath(this.config.locations);
                this._buildProvider(shapePath);
            }
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
                    case OSFramework.Enum.OS_Config_Shape.allowDrag:
                        return this.provider.set('draggable', value);
                    case OSFramework.Enum.OS_Config_Shape.allowEdit:
                        return this.provider.set('editable', value);
                    case OSFramework.Enum.OS_Config_Shape.strokeOpacity:
                        return this.provider.set('strokeOpacity', value);
                    case OSFramework.Enum.OS_Config_Shape.strokeColor:
                        return this.provider.set('strokeColor', value);
                    case OSFramework.Enum.OS_Config_Shape.strokeWeight:
                        return this.provider.set('strokeWeight', value);
                    default:
                        super.changeProperty(propertyName, value);
                }
            }
        }

        public dispose(): void {
            if (this.isReady) {
                this.provider.set('map', null);
            }
            this._provider = undefined;
            super.dispose();
        }

        public refreshProviderEvents(): void {
            if (this.isReady) this._setShapeEvents();
        }

        public abstract get shapeTag(): string;

        protected abstract _createProvider(
            locations:
                | Array<OSFramework.OSStructures.OSMap.Coordinates>
                | OSFramework.OSStructures.OSMap.Coordinates
        ): W;
        protected abstract _setProviderPath(
            path: Array<OSFramework.OSStructures.OSMap.Coordinates>
        ): void;
    }
}
