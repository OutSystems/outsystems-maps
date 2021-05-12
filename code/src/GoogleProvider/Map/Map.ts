/// <reference path="../../OSFramework/OSMap/AbstractMap.ts" />

// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace GoogleProvider.Map {
    export class Map
        extends OSFramework.OSMap.AbstractMap<
            google.maps.Map,
            OSFramework.Configuration.OSMap.GoogleMapConfig
        >
        implements IMapGoogle {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        private _advancedFormatObj: any;
        private _fBuilder: Feature.FeatureBuilder;
        private _listeners: Array<string>;
        private _scriptCallback: () => void;

        // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
        constructor(mapId: string, configs: any) {
            super(
                mapId,
                new OSFramework.Configuration.OSMap.GoogleMapConfig(configs)
            );
        }

        // eslint-disable-next-line @typescript-eslint/member-ordering
        private _buildMarkers(): void {
            this.markers.forEach((marker) => marker.build());
        }

        /**
         * Creates the Map via GoogleMap API
         */
        private _createGoogleMap(): void {
            document
                .getElementById('google-maps-script')
                .removeEventListener('load', this._scriptCallback);
            if (typeof google === 'object' && typeof google.maps === 'object') {
                // Make sure the center is saved before setting a default value which is going to be used
                // before the conversion of the location to coordinates gets resolved
                const currentCenter = this.config.center;

                this._provider = new google.maps.Map(
                    OSFramework.Helper.GetElementByUniqueId(this.uniqueId),
                    // The provider config will retrieve the default center position
                    // (this.config.center = OSFramework.Helper.Constants.defaultMapCenter)
                    // Which will get updated after the Map is rendered
                    this._getProviderConfig()
                );

                // Check if the provider has been created with a valid APIKey
                window[
                    'gm_authFailure'
                ] = MapAPI.MapManager.GetActiveMap().mapEvents.trigger(
                    OSFramework.Event.OSMap.MapEventType.OnError,
                    OSFramework.Enum.Errors.InvalidApiKey
                );

                this.buildFeatures();
                this._buildMarkers();
                this.finishBuild();

                // We can only set the events on the provider after its creation
                this._setMapEvents(this._advancedFormatObj.mapEvents);

                // Make sure to change the center after the conversion of the location to coordinates
                this.features.center.updateCenter(currentCenter);

                // Make sure the style is converted from an id to the correspondent JSON
                this._provider.setOptions({
                    styles: GetStyleByStyleId(this.config.style),
                    ...this._advancedFormatObj
                });
            } else {
                throw Error(`The google.maps lib has not been loaded.`);
            }
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        private _getProviderConfig(): google.maps.MapOptions {
            // Make sure the center has a default value before the conversion of the location to coordinates
            this.config.center = OSFramework.Helper.Constants.defaultMapCenter;
            // Take care of the advancedFormat options which can override the previous configuration
            this._advancedFormatObj = OSFramework.Helper.JsonFormatter(
                this.config.advancedFormat
            );

            return this.config.getProviderConfig();
        }

        /**
         * Initializes the Google Map.
         * 1) Add the script from GoogleAPIS to the header of the page
         * 2) Creates the Map via GoogleMap API
         */
        private _initializeGoogleMap(): void {
            let script = document.getElementById(
                'google-maps-script'
            ) as HTMLScriptElement;
            if (script === null) {
                script = document.createElement('script');
                script.src =
                    'https://maps.googleapis.com/maps/api/js?key=' +
                    this.config.apiKey;
                script.async = true;
                script.defer = true;
                script.id = 'google-maps-script';
                document.head.appendChild(script);
            }
            this._scriptCallback = this._createGoogleMap.bind(this);
            script.addEventListener('load', this._scriptCallback);
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        private _setMapEvents(events: Array<string>) {
            if (this._listeners === undefined) this._listeners = [];
            // Make sure the listeners get removed before adding the new ones
            this._listeners.forEach((eventListener, index) => {
                google.maps.event.clearListeners(this.provider, eventListener);
                this._listeners.splice(index, 1);
            });

            // OnEventTriggered Event (other events that can be set on the advancedFormat of the Map)
            if (
                this.mapEvents.hasHandlers(
                    OSFramework.Event.OSMap.MapEventType.OnEventTriggered
                ) &&
                events !== undefined
            ) {
                events.forEach((eventName: string) => {
                    this._listeners.push(eventName);
                    this._provider.addListener(eventName, () => {
                        this.mapEvents.trigger(
                            OSFramework.Event.OSMap.MapEventType
                                .OnEventTriggered,
                            eventName
                        );
                    });
                });
            }
        }

        public addMarker(
            marker: OSFramework.Marker.IMarker
        ): OSFramework.Marker.IMarker {
            super.addMarker(marker);

            if (this.isReady) {
                marker.build();
            }

            return marker;
        }

        public build(): void {
            super.build();

            this._initializeGoogleMap();
        }

        public buildFeatures(): void {
            this._fBuilder = new Feature.FeatureBuilder(this);
            this._features = this._fBuilder.features;
            this._fBuilder.build();
        }

        public changeMarkerProperty(
            markerId: string,
            propertyName: string,
            // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
            propertyValue: any
        ): void {
            const marker = this.getMarker(markerId);

            if (!marker) {
                console.error(
                    `changeMarkerProperty - marker id:${markerId} not found.`
                );
            } else {
                marker.changeProperty(propertyName, propertyValue);
            }
        }

        // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
        public changeProperty(propertyName: string, value: any): void {
            const propValue = OSFramework.Enum.OS_Config_Map[propertyName];

            switch (propValue) {
                case OSFramework.Enum.OS_Config_Map.center:
                    return this.features.center.updateCenter(value);
                case OSFramework.Enum.OS_Config_Map.offset:
                    return this.features.offset.setOffset(JSON.parse(value));
                case OSFramework.Enum.OS_Config_Map.zoom:
                    return this.features.zoom.setLevel(value);
                case OSFramework.Enum.OS_Config_Map.type:
                    return this._provider.setMapTypeId(value);
                case OSFramework.Enum.OS_Config_Map.style:
                    return this._provider.setOptions({
                        styles: GetStyleByStyleId(value)
                    });
                case OSFramework.Enum.OS_Config_Map.advancedFormat:
                    value = OSFramework.Helper.JsonFormatter(value);
                    // Make sure the MapEvents that are associated in the advancedFormat get updated
                    this._setMapEvents(value.mapEvents);
                    return this._provider.setOptions(value);
                case OSFramework.Enum.OS_Config_Map.showTraffic:
                    return this.features.trafficLayer.setState(value);
                default:
                    throw Error(
                        `changeProperty - Property '${propertyName}' can't be changed.`
                    );
            }
        }

        public dispose(): void {
            super.dispose();

            this._fBuilder.dispose();

            this._provider = undefined;
        }

        public refresh(): void {
            let position = this.features.center.getCenter();
            // If the configured center position of the map is equal to the default
            // When the position is empty, we use the default position
            const isDefault =
                position.toString() ===
                OSFramework.Helper.Constants.defaultMapCenter.toString();
            if (
                isDefault &&
                this.markers.length >= 1 &&
                this.markers[0].provider !== undefined
            ) {
                position = this.markers[0].provider.position.toJSON();
            } else if (
                this.markers.length === 1 &&
                this.markers[0].provider !== undefined
            ) {
                position = this.markers[0].provider.position.toJSON();
            } else if (
                this.markers.length >= 2 &&
                this.markers[0].provider !== undefined &&
                this.features.zoom.isAutofit
            ) {
                position = this.markers[0].provider.position.toJSON();
            }

            // Refresh the center position
            this.features.center.refreshCenter(position);

            // Refresh the zoom
            this.features.zoom.refreshZoom();

            // Refresh the offset
            this.features.offset.setOffset(this.features.offset.getOffset);
        }
    }
}
