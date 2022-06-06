/// <reference path="../../../OSFramework/Marker/AbstractMarker.ts" />

// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace Provider.Leaflet.Marker {
    export class Marker
        extends OSFramework.Marker.AbstractMarker<
            L.Marker,
            Configuration.Marker.LeafletMarkerConfig
        >
        implements IMarkerLeaflet
    {
        private _addedEvents: Array<string>;
        private _defaultIcon: L.DivIcon;
        private _defaultTooltip: L.TooltipOptions;

        constructor(
            map: OSFramework.OSMap.IMap,
            markerId: string,
            type: OSFramework.Enum.MarkerType,
            configs: Configuration.Marker.LeafletMarkerConfig
        ) {
            super(
                map,
                markerId,
                type,
                new Configuration.Marker.LeafletMarkerConfig(configs)
            );
            this._defaultIcon = new L.DivIcon({
                iconSize: Constants.Marker.defaultSize,
                className: 'marker-leaflet-icon',
                iconAnchor: Constants.Marker.defaultAnchor
            });
            this._defaultTooltip = {
                permanent: true,
                direction: 'top',
                className: 'marker-leaflet-transparent-tooltip'
            };
            this._addedEvents = [];
        }

        private async _getMeta(
            url
        ): Promise<{ width: number; height: number }> {
            return new Promise((resolve, reject) => {
                const img = new Image();
                img.onload = () =>
                    resolve({
                        width: img.width,
                        height: img.height
                    });
                img.onerror = (error) => reject(error);
                img.src = url;
            });
        }
        /**
         * Sets the new icon on the Marker just by using the iconUrl
         * The width and the height of the icon will use the one in the configs (if set) or will use the default image size
         * The icon will be centered by x axis on the marker position but on the y axis it will appear right above it
         */
        private async _setIcon(iconUrl: string) {
            let icon: L.DivIcon;
            // If the iconUrl is not set or is empty, we should use the defaultIcon
            if (iconUrl === '') {
                // icon will have the following configurations:
                // iconSize: [24, 40],
                // className: 'marker-leaflet-icon',
                // iconAnchor: [12, 40]
                icon = this._defaultIcon;
            } else {
                let iconSize: L.PointExpression;
                let iconAnchor: L.PointExpression;
                // If the size of the icon is defined by a valid width and height, use those values
                // Else If nothing is passed or the icon size has the width or the height equal to 0, use the full image size
                if (this.config.iconWidth > 0 && this.config.iconHeight > 0) {
                    iconSize = [this.config.iconWidth, this.config.iconHeight];
                    // The icon will be centered by x axis on the marker position but on the y axis it will appear right above it
                    iconAnchor = [
                        this.config.iconWidth / 2,
                        this.config.iconHeight
                    ];
                } else {
                    // get the image's size to set the location of the marker in the map correctly
                    try {
                        const { width, height } = await this._getMeta(iconUrl);
                        this.config.iconWidth = width;
                        this.config.iconHeight = height;
                        iconSize = [
                            this.config.iconWidth,
                            this.config.iconHeight
                        ];
                        iconAnchor = [
                            this.config.iconWidth / 2,
                            this.config.iconHeight
                        ];
                    } catch (e) {
                        // Could not load image from specified URL
                        console.error(e);
                    }
                }
                // Update the icon using the previous configurations
                icon = new L.Icon({
                    iconUrl,
                    iconSize,
                    iconAnchor
                });
            }
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

        /**
         * Sets the label on the marker (by using a tooltip alike)
         */
        private _setLabelContent(content: string): void {
            // If the content is empty or is not set, just remove it from the Marker
            if (content === '') {
                this.provider.unbindTooltip();
                return;
            }

            const tooltip = this.provider.getTooltip();
            if (tooltip) {
                // IF the tooltip exists, then just update its content
                this.provider.setTooltipContent(content);
            } else {
                // IF the tooltip doesn't exist (yet), use the default tooltip settings
                // permanent: true,
                // className: 'marker-leaflet-transparent-tooltip'
                this.provider.bindTooltip(content, this._defaultTooltip);
            }
        }

        protected _buildMarkerLocation(): Promise<L.LatLng> {
            let markerLocation: L.LatLng;
            // If the marker has no location at the moment of its provider creation, then throw an error
            // If the marker has its location = "" at the moment of its provider creation, then the location value will be the default -> OutSystems, Boston US
            if (typeof this.config.location === 'undefined') {
                this.map.mapEvents.trigger(
                    OSFramework.Event.OSMap.MapEventType.OnError,
                    this.map,
                    OSFramework.Enum.ErrorCodes
                        .LIB_FailedGeocodingLeafletMarker,
                    `Location of the Marker can't be empty.`
                );
                return;
            } else {
                // Let's return a promise that will be resolved or rejected according to the result
                return new Promise((resolve, reject) => {
                    Helper.Conversions.ValidateCoordinates(this.config.location)
                        .then((response) => {
                            markerLocation = new L.LatLng(
                                response.lat,
                                response.lng
                            );
                            resolve(markerLocation);
                        })
                        .catch((e) => reject(e));
                });
            }
        }

        protected _setMarkerEvents(): void {
            // Make sure the listeners get removed before adding the new ones
            this._addedEvents.forEach((eventListener, index) => {
                this.provider.removeEventListener(eventListener);
                this._addedEvents.splice(index, 1);
            });

            // OnClick Event
            if (
                this.markerEvents.hasHandlers(
                    OSFramework.Event.Marker.MarkerEventType.OnClick
                )
            ) {
                this._provider.addEventListener(
                    'click',
                    (e?: L.LeafletMouseEvent) => {
                        const coordinates =
                            new OSFramework.OSStructures.OSMap.OSCoordinates(
                                e.latlng.lat,
                                e.latlng.lng
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

            // Any events that got added to the markerEvents via the API Subscribe method will have to be taken care here
            // If the Event type of each handler is MarkerProviderEvent, we want to make sure to add that event to the listeners of the google marker provider (e.g. click, dblclick, contextmenu, etc)
            // Otherwise, we don't want to add them to the google provider listeners (e.g. OnInitialize, OnTriggeredEvent, etc)
            this.markerEvents.handlers.forEach(
                (handler: OSFramework.Event.IEvent<string>, eventName) => {
                    if (
                        handler instanceof
                        OSFramework.Event.Marker.MarkerProviderEvent
                    ) {
                        this._addedEvents.push(eventName);
                        this._provider.addEventListener(
                            // Name of the event (e.g. click, dblclick, contextmenu, etc)
                            Constants.Marker.ProviderEventNames[eventName],
                            // Callback CAN have an attribute (e) which is of the type MapMouseEvent
                            // Trigger the event by specifying the ProviderEvent MarkerType and the coords (lat, lng) if the callback has the attribute MapMouseEvent
                            (e?: L.LeafletMouseEvent) => {
                                this.markerEvents.trigger(
                                    // EventType
                                    OSFramework.Event.Marker.MarkerEventType
                                        .ProviderEvent,
                                    // EventName
                                    eventName,
                                    // Coords
                                    e !== undefined &&
                                        e.target.getLatLng() !== undefined
                                        ? JSON.stringify({
                                              Lat: e.target.getLatLng().lat,
                                              Lng: e.target.getLatLng().lng
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

            // First build all MarkerOptions
            // Then, create the provider (Google maps Marker)
            // Then, set Marker events
            // Finally, refresh the Map
            const markerLocation = this._buildMarkerLocation();
            const configs = this.getProviderConfig();
            // If markerOptions is undefined (should be a promise) -> don't create the marker
            if (markerLocation !== undefined) {
                markerLocation
                    .then((location: L.LatLng) => {
                        this._provider = L.marker(location, configs);
                        this._setIcon(configs.iconUrl);
                        this._setLabelContent(configs.label);

                        this._provider.addTo(this.map.provider);
                        // We can only set the events on the provider after its creation
                        this._setMarkerEvents();

                        // Finish build of Marker
                        this.finishBuild();

                        // Trigger the new center location after creating the marker
                        this.map.refresh();
                    })
                    .catch(() => {
                        this.map.mapEvents.trigger(
                            OSFramework.Event.OSMap.MapEventType.OnError,
                            this.map,
                            OSFramework.Enum.ErrorCodes
                                .LIB_FailedGeocodingLeafletMarker
                        );
                    });
            }
        }

        // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
        public changeProperty(propertyName: string, value: any): void {
            const property = OSFramework.Enum.OS_Config_Marker[propertyName];
            super.changeProperty(propertyName, value);
            if (this.isReady) {
                switch (property) {
                    case OSFramework.Enum.OS_Config_Marker.location:
                        Helper.Conversions.ValidateCoordinates(value)
                            .then((response) => {
                                this._provider.setLatLng({
                                    lat: response.lat,
                                    lng: response.lng
                                });
                                this.map.refresh();
                            })
                            .catch(() => {
                                this.map.mapEvents.trigger(
                                    OSFramework.Event.OSMap.MapEventType
                                        .OnError,
                                    this.map,
                                    OSFramework.Enum.ErrorCodes
                                        .LIB_FailedGeocodingLeafletMarker
                                );
                            });
                        return;
                    case OSFramework.Enum.OS_Config_Marker.allowDrag:
                        value
                            ? this._provider.dragging.enable()
                            : this._provider.dragging.disable();
                        return;
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
                        this._setLabelContent(value);
                        return;
                    case OSFramework.Enum.OS_Config_Marker.title:
                        this._provider.getElement().title = value;
                        return;
                }
            }
        }

        public dispose(): void {
            if (this.isReady) {
                this.map.provider.removeLayer(this.provider);
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
