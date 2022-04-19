/// <reference path="../../../OSFramework/Marker/AbstractMarker.ts" />

// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace Provider.Google.Marker {
    export class Marker
        extends OSFramework.Marker.AbstractMarker<
            google.maps.Marker,
            Configuration.Marker.GoogleMarkerConfig
        >
        implements IMarkerGoogle
    {
        private _addedEvents: Array<string>;

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
            this._addedEvents = [];
        }

        private _setIcon(url: string): void {
            let scaledSize: google.maps.Size;
            // If the size of the icon is defined by a valid width and height, use those values
            // Else If nothing is passed or the icon size has the width or the height equal to 0, use the full image size
            if (this.config.iconWidth > 0 && this.config.iconHeight > 0) {
                scaledSize = new google.maps.Size(
                    this.config.iconWidth,
                    this.config.iconHeight
                );
            }
            // Update the icon using the previous configurations
            const icon = {
                url,
                scaledSize
            };
            // Set the icon to the Marker provider
            this.provider.setIcon(icon);
        }

        /**
         * This method is usefull to be used by the changeProperty method only
         * As it requires a config update before being able to use it
         */
        private _setIconSize(): void {
            // The width and the height of the icon will be acquired using the config.iconWidth and config.iconHeight
            // Therefore, just by calling the _setIcon private method we are going to set the same iconUrl that is already being used
            // But the icon will be updated and will be using the new size
            this._setIcon(this.config.iconUrl);
        }

        protected _buildMarkerPosition(): Promise<google.maps.MarkerOptions> {
            const markerOptions: google.maps.MarkerOptions = {};
            // If the marker has no location at the moment of its provider creation, then throw an error
            // If the marker has its location = "" at the moment of its provider creation, then the location value will be the default -> OutSystems, Boston US
            if (typeof this.config.location === 'undefined') {
                this.map.mapEvents.trigger(
                    OSFramework.Event.OSMap.MapEventType.OnError,
                    this.map,
                    OSFramework.Enum.ErrorCodes.LIB_FailedGeocodingMarker,
                    `Location of the Marker can't be empty.`
                );
                return;
            } else {
                // Let's return a promise that will be resolved or rejected according to the result
                return new Promise((resolve, reject) => {
                    Helper.Conversions.ConvertToCoordinates(
                        this.config.location,
                        this.map.config.apiKey
                    )
                        .then((response) => {
                            markerOptions.position = {
                                lat: response.lat,
                                lng: response.lng
                            };
                            resolve(markerOptions);
                        })
                        .catch((e) => reject(e));
                });
            }
        }

        protected _setMarkerEvents(): void {
            // Make sure the listeners get removed before adding the new ones
            this._addedEvents.forEach((eventListener, index) => {
                google.maps.event.clearListeners(this.provider, eventListener);
                this._addedEvents.splice(index, 1);
            });

            // OnClick Event (OS accelerator)
            if (
                this.markerEvents.hasHandlers(
                    OSFramework.Event.Marker.MarkerEventType.OnClick
                )
            ) {
                this._provider.addListener(
                    'click',
                    (e: google.maps.MapMouseEvent) => {
                        const coordinates =
                            new OSFramework.OSStructures.OSMap.OSCoordinates(
                                e.latLng.lat(),
                                e.latLng.lng()
                            );
                        this.markerEvents.trigger(
                            // EventType
                            OSFramework.Event.Marker.MarkerEventType.OnClick,
                            // EventName
                            OSFramework.Event.Marker.MarkerEventType.OnClick,
                            // Coords
                            JSON.stringify(coordinates)
                        );
                    }
                );
            }

            // Other Provider Events (OS Marker Event Block)
            // Any events that got added to the markerEvents via the API Subscribe method will have to be taken care here
            // If the Event type of each handler is MarkerProviderEvent, we want to make sure to add that event to the listeners of the google marker provider (e.g. click, dblclick, contextmenu, etc)
            this.markerEvents.handlers.forEach(
                (handler: OSFramework.Event.IEvent<string>, eventName) => {
                    if (
                        handler instanceof
                        OSFramework.Event.Marker.MarkerProviderEvent
                    ) {
                        this._addedEvents.push(eventName);
                        this._provider.addListener(
                            // Name of the event (e.g. click, dblclick, contextmenu, etc)
                            Constants.Marker.ProviderEventNames[eventName],
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

        public build(): void {
            super.build();

            // First build the Marker Position
            // Then, create the provider (Google maps Marker)
            // Then, set Marker events
            // Finally, refresh the Map
            const markerPosition = this._buildMarkerPosition();
            // If markerPosition is undefined (should be a promise) -> don't create the marker
            if (markerPosition !== undefined) {
                markerPosition
                    .then((markerOptions) => {
                        this._provider = new google.maps.Marker({
                            ...this.getProviderConfig(),
                            ...markerOptions,
                            map: this.map.provider
                        });

                        // We can only set the events on the provider after its creation
                        this._setMarkerEvents();

                        // Finish build of Marker
                        this.finishBuild();

                        // Trigger the new center location after creating the marker
                        this.map.refresh();
                    })
                    .catch((error) => {
                        this.map.mapEvents.trigger(
                            OSFramework.Event.OSMap.MapEventType.OnError,
                            this.map,
                            OSFramework.Enum.ErrorCodes
                                .LIB_FailedGeocodingMarker,
                            `${error}`
                        );
                    });
            }
        }

        // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
        public changeProperty(propertyName: string, value: any): void {
            const propValue = OSFramework.Enum.OS_Config_Marker[propertyName];
            super.changeProperty(propertyName, value);
            if (this.isReady) {
                switch (propValue) {
                    case OSFramework.Enum.OS_Config_Marker.location:
                        Helper.Conversions.ConvertToCoordinates(
                            value,
                            this.map.config.apiKey
                        )
                            .then((response) => {
                                this._provider.setPosition({
                                    lat: response.lat,
                                    lng: response.lng
                                });
                                this.map.refresh();
                            })
                            .catch((error) => {
                                this.map.mapEvents.trigger(
                                    OSFramework.Event.OSMap.MapEventType
                                        .OnError,
                                    this.map,
                                    OSFramework.Enum.ErrorCodes
                                        .LIB_FailedGeocodingMarker,
                                    `${error}`
                                );
                            });
                        return;
                    case OSFramework.Enum.OS_Config_Marker.allowDrag:
                        return this._provider.setDraggable(value);
                    case OSFramework.Enum.OS_Config_Marker.iconHeight:
                        this._setIconSize();
                        return;
                    case OSFramework.Enum.OS_Config_Marker.iconUrl:
                        this._setIcon(value);
                        return;
                    case OSFramework.Enum.OS_Config_Marker.iconWidth:
                        this._setIconSize();
                        return;
                    case OSFramework.Enum.OS_Config_Marker.label:
                        return this._provider.setLabel(value);
                    case OSFramework.Enum.OS_Config_Marker.title:
                        return this._provider.setTitle(value);
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
            if (this.isReady) this._setMarkerEvents();
        }

        public validateProviderEvent(eventName: string): boolean {
            return Constants.Marker.ProviderEventNames[eventName] !== undefined;
        }
    }
}
