/// <reference path="../../OSFramework/Shape/AbstractShape.ts" />

// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace GoogleProvider.Shape {
    export class Polyline
        extends OSFramework.Shape.AbstractShape<
            google.maps.Polyline,
            Configuration.Shape.GoogleShapeConfig
        >
        implements IShapeGoogle {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        private _listeners: Array<string>;

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
                new Configuration.Shape.GoogleShapeConfig(configs)
            );
        }

        protected _buildPath(
            loc: string
        ): Promise<Array<OSFramework.OSStructures.OSMap.Coordinates>> {
            // If The Polyline doesn't have at least 2 valid address/coordinates, then throw an error
            if (
                typeof loc !== 'string' ||
                loc === '' ||
                loc.trim().length === 0 ||
                JSON.parse(loc).length < 2
            ) {
                this.map.mapEvents.trigger(
                    OSFramework.Event.OSMap.MapEventType.OnError,
                    this.map,
                    OSFramework.Enum.ErrorCodes
                        .CFG_InvalidPolylineShapeLocations
                );
                return;
            } else {
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
                        if (
                            typeof location !== 'string' ||
                            location === '' ||
                            location.trim().length === 0
                        ) {
                            this.map.mapEvents.trigger(
                                OSFramework.Event.OSMap.MapEventType.OnError,
                                this.map,
                                OSFramework.Enum.ErrorCodes
                                    .CFG_InvalidPolylineShapeLocations
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
                                            .sort()
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

        protected _setShapeEvents(): void {
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
                this._provider.addListener('click', () => {
                    this.shapeEvents.trigger(
                        OSFramework.Event.Shape.ShapeEventType.OnClick
                    );
                });
            }

            // Any events that got added to the shapeEvents via the API Subscribe method will have to be taken care here
            // If the Event type of each handler is ShapeProviderEvent, we want to make sure to add that event to the listeners of the google shape provider (e.g. click, dblclick, contextmenu, etc)
            // Otherwise, we don't want to add them to the google provider listeners (e.g. OnInitialize, OnTriggeredEvent, etc)
            this.shapeEvents.handlers.forEach(
                (handler: OSFramework.Event.IEvent<string>, eventName) => {
                    if (
                        handler instanceof
                        OSFramework.Event.Shape.ShapeProviderEvent
                    ) {
                        this._listeners.push(eventName);
                        this._provider.addListener(
                            // Name of the event (e.g. click, dblclick, contextmenu, etc)
                            eventName,
                            // Callback CAN have an attribute (e) which is of the type MapMouseEvent
                            // eslint-disable-next-line @typescript-eslint/no-unused-vars
                            (e?: google.maps.MapMouseEvent) => {
                                this.shapeEvents.trigger(
                                    // EventType
                                    OSFramework.Event.Shape.ShapeEventType
                                        .ProviderEvent,
                                    // EventName
                                    eventName
                                    // Coords
                                    // e !== undefined
                                    //     ? JSON.stringify({
                                    //           Lat: e.latLng.lat(),
                                    //           Lng: e.latLng.lng()
                                    //       })
                                    //     : undefined
                                );
                            }
                        );
                    }
                }
            );
        }

        /** Checks if the Shape has associated events */
        public get hasEvents(): boolean {
            return this.shapeEvents !== undefined;
        }

        public get shapeTag(): string {
            return OSFramework.Helper.Constants.shapePolylineTag;
        }

        public get providerEvents(): Array<string> {
            return Constants.Shape.Events;
        }

        public build(): void {
            super.build();

            // First build Path from locations
            // Then, create the provider (Google maps Shape)
            // Finally, set Shape events
            const shapePath = this._buildPath(this.config.locations);
            // If path is undefined (should be a promise) -> don't create the shape
            if (shapePath !== undefined) {
                shapePath
                    .then((path) => {
                        this._provider = new google.maps.Polyline({
                            map: this.map.provider,
                            path,
                            ...this.getProviderConfig()
                        });

                        // We can only set the events on the provider after its creation
                        this._setShapeEvents();

                        // Finish build of Shape
                        this.finishBuild();
                    })
                    .catch((error) => {
                        this.map.mapEvents.trigger(
                            OSFramework.Event.OSMap.MapEventType.OnError,
                            this.map,
                            OSFramework.Enum.ErrorCodes
                                .LIB_FailedGeocodingShapeLocations,
                            `${error}`
                        );
                    });
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
                                    this._provider.setPath(path);
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
                    case OSFramework.Enum.OS_Config_Shape.allowDrag:
                        return this._provider.setDraggable(value);
                    case OSFramework.Enum.OS_Config_Shape.allowEdit:
                        return this._provider.setEditable(value);
                    case OSFramework.Enum.OS_Config_Shape.opacity:
                        return this._provider.setOptions({
                            strokeOpacity: value
                        });
                    case OSFramework.Enum.OS_Config_Shape.color:
                        return this._provider.setOptions({
                            strokeColor: value
                        });
                    case OSFramework.Enum.OS_Config_Shape.weight:
                        return this._provider.setOptions({
                            strokeWeight: value
                        });
                    default:
                        this.map.mapEvents.trigger(
                            OSFramework.Event.OSMap.MapEventType.OnError,
                            this.map,
                            OSFramework.Enum.ErrorCodes
                                .GEN_InvalidChangePropertyShape,
                            `${propertyName}`
                        );
                }
            }
        }

        public dispose(): void {
            if (this.isReady) {
                this._provider.setMap(null);
            }
            this._provider = undefined;
            super.dispose();
        }

        public refreshProviderEvents(): void {
            if (this.isReady) this._setShapeEvents();
        }
    }
}
