/// <reference path="../../OSFramework/Marker/AbstractMarker.ts" />

// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace GoogleProvider.Marker {
    export class Marker
        extends OSFramework.Marker.AbstractMarker<
            google.maps.Marker,
            Configuration.Marker.GoogleMarkerConfig
        >
        implements IMarkerGoogle {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        private _advancedFormatObj: any;
        private _listeners: Array<string>;

        constructor(
            map: OSFramework.OSMap.IMap,
            markerId: string,
            type: OSFramework.Enum.MarkerType,
            // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
            configs: any
        ) {
            super(
                map,
                markerId,
                type,
                new Configuration.Marker.GoogleMarkerConfig(configs)
            );
        }

        protected _buildMarkerOptions(): Promise<google.maps.MarkerOptions> {
            const markerOptions: google.maps.MarkerOptions = {};
            // If the marker has no location at the moment of its provider creation, then throw an error
            if (
                typeof this.config.location === 'undefined' ||
                this.config.location === ''
            ) {
                throw new Error('Invalid location');
            } else {
                if (
                    typeof this.config.iconUrl !== 'undefined' &&
                    this.config.iconUrl !== ''
                ) {
                    markerOptions.icon = this.config.iconUrl;
                }

                if (
                    typeof this.config.title !== 'undefined' &&
                    this.config.title !== ''
                ) {
                    markerOptions.title = this.config.title;
                }

                if (typeof this.config.allowDrag !== 'undefined') {
                    markerOptions.draggable = this.config.allowDrag;
                }

                // Take care of the advancedFormat options which can override the previous configuration
                this._advancedFormatObj = OSFramework.Helper.JsonFormatter(
                    this.config.advancedFormat
                );
                for (const property in this._advancedFormatObj) {
                    const value = this._advancedFormatObj[property];
                    this.config[property] = value;
                    markerOptions[property] = value;
                }

                if (
                    typeof this.config.location !== 'undefined' &&
                    this.config.location !== ''
                ) {
                    // Let's return a promise that will be
                    return new Promise((resolve) => {
                        resolve(
                            Helper.Conversions.ConvertToCoordinates(
                                this.config.location,
                                this.map.config.apiKey
                            ).then((response) => {
                                markerOptions.position = {
                                    lat: response.lat,
                                    lng: response.lng
                                };
                                markerOptions.map = this.map.provider;
                                return markerOptions;
                            })
                        );
                    });
                }
            }
        }

        // This method will be removed as soon as the markers by input parameter get deprecated
        protected _setMarkerEvents(events?: Array<string>): void {
            if (this._listeners === undefined) this._listeners = [];
            // Make sure the listeners get removed before adding the new ones
            this._listeners.forEach((eventListener, index) => {
                google.maps.event.clearListeners(this.provider, eventListener);
                this._listeners.splice(index, 1);
            });

            // OnClick Event
            if (
                this.markerEvents.hasHandlers(
                    OSFramework.Event.Marker.MarkerEventType.OnClick
                )
            ) {
                this._provider.addListener('click', () => {
                    this.markerEvents.trigger(
                        OSFramework.Event.Marker.MarkerEventType.OnClick
                    );
                });
            }
            // OnMouseOver Event
            if (
                this.markerEvents.hasHandlers(
                    OSFramework.Event.Marker.MarkerEventType.OnMouseover
                )
            ) {
                this._provider.addListener('mouseover', () => {
                    this.markerEvents.trigger(
                        OSFramework.Event.Marker.MarkerEventType.OnMouseover
                    );
                });
            }
            // OnMouseOut Event
            if (
                this.markerEvents.hasHandlers(
                    OSFramework.Event.Marker.MarkerEventType.OnMouseout
                )
            ) {
                this._provider.addListener('mouseout', () => {
                    this.markerEvents.trigger(
                        OSFramework.Event.Marker.MarkerEventType.OnMouseout
                    );
                });
            }
            // OnEventTriggered Event (other events that can be set on the advancedFormat of the Marker)
            if (
                this.markerEvents.hasHandlers(
                    OSFramework.Event.Marker.MarkerEventType.OnEventTriggered
                ) &&
                events !== undefined
            ) {
                events.forEach((eventName: string) => {
                    this._listeners.push(eventName);
                    this._provider.addListener(eventName, () => {
                        this.markerEvents.trigger(
                            OSFramework.Event.Marker.MarkerEventType
                                .OnEventTriggered,
                            eventName
                        );
                    });
                });
            }

            // Any events that got added to the markerEvents via the API Subscribe method will have to be taken care here
            // If the Event type of each handler is MarkerProviderEvent, we want to make sure to add that event to the listeners of the google marker provider (e.g. click, dblclick, contextmenu, etc)
            // Otherwise, we don't want to add them to the google provider listeners (e.g. OnInitialize, OnTriggeredEvent, etc)
            this.markerEvents.handlers.forEach(
                (handler: OSFramework.Event.IEvent<string>, eventName) => {
                    if (
                        handler instanceof
                        OSFramework.Event.Marker.MarkerProviderEvent
                    ) {
                        this._listeners.push(eventName);
                        this._provider.addListener(
                            // Name of the event (e.g. click, dblclick, contextmenu, etc)
                            eventName,
                            // Callback CAN have an attribute (e) which is of the type MapMouseEvent
                            // Trigger the event by specifying the ProviderEvent MarkerType and the coords (lat, lng) if the callback has the attribute MapMouseEvent
                            (e?: google.maps.MapMouseEvent) => {
                                this.markerEvents.trigger(
                                    // EventType
                                    OSFramework.Event.Marker.MarkerEventType
                                        .ProviderEvent,
                                    // EventName
                                    eventName,
                                    // Coords
                                    e !== undefined
                                        ? JSON.stringify({
                                              Lat: e.latLng.lat(),
                                              Lng: e.latLng.lng()
                                          })
                                        : undefined
                                );
                            }
                        );
                    }
                }
            );
        }

        /** Checks if the Marker has associated events */
        public get hasEvents(): boolean {
            return this.markerEvents !== undefined;
        }

        public get markerTag(): string {
            return OSFramework.Helper.Constants.markerTag;
        }

        public get providerEvents(): Array<string> {
            return Constants.Marker.Events;
        }

        public build(): void {
            super.build();

            // First build all MarkerOptions
            // Then, create the provider (Google maps Marker)
            // Then, set Marker events
            // Finally, refresh the Map
            this._buildMarkerOptions().then((markerOptions) => {
                this._provider = new google.maps.Marker(markerOptions);

                // We can only set the events on the provider after its creation
                this._setMarkerEvents(this._advancedFormatObj.markerEvents);

                // Finish build of Marker
                this.finishBuild();

                // Trigger the new center location after creating the marker
                this.map.refresh();
            });
        }

        // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
        public changeProperty(propertyName: string, value: any): void {
            const propValue = OSFramework.Enum.OS_Config_Marker[propertyName];
            switch (propValue) {
                case OSFramework.Enum.OS_Config_Marker.location:
                    Helper.Conversions.ConvertToCoordinates(
                        value,
                        this.map.config.apiKey
                    ).then((response) => {
                        this._provider.setPosition({
                            lat: response.lat,
                            lng: response.lng
                        });
                        this.map.refresh();
                    });
                    return;
                case OSFramework.Enum.OS_Config_Map.advancedFormat:
                    value = OSFramework.Helper.JsonFormatter(value);
                    // Make sure the MapEvents that are associated in the advancedFormat get updated
                    this._setMarkerEvents(value.markerEvents);
                    this._provider.setOptions(value);
                    return this.map.refresh();
                case OSFramework.Enum.OS_Config_Marker.allowDrag:
                    return this._provider.setDraggable(value);
                case OSFramework.Enum.OS_Config_Marker.iconUrl:
                    return this._provider.setIcon(value);
                case OSFramework.Enum.OS_Config_Marker.title:
                    return this._provider.setTitle(value);

                default:
                    throw Error(
                        `changeProperty - Property '${propertyName}' can't be changed.`
                    );
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
            if (this.isReady) this._setMarkerEvents();
        }
    }
}
