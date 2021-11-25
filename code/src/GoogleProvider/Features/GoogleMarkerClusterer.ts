// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace GoogleProvider.Feature {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    export class GoogleMarkerClusterer
        implements
            OSFramework.Feature.IMarkerClusterer,
            OSFramework.Interface.IBuilder,
            OSFramework.Interface.IDisposable
    {
        private _config: Configuration.MarkerClusterer.MarkerClustererConfig;
        private _map: OSMap.IMapGoogle;
        private _markerClusterer: MarkerClusterer;
        private _repaintOnTilesLoaded: google.maps.MapsEventListener;

        constructor(
            map: OSMap.IMapGoogle,
            markerClustererConfigs: Configuration.MarkerClusterer.MarkerClustererConfig
        ) {
            this._map = map;
            // Set the clusterer configs
            this._config =
                new Configuration.MarkerClusterer.MarkerClustererConfig(
                    markerClustererConfigs
                );
        }

        public get markerClusterer(): MarkerClusterer {
            return this._markerClusterer;
        }

        public get isEnabled(): boolean {
            return this._config.markerClustererActive;
        }

        private _setState(value: boolean): void {
            this._markerClusterer.setMap(
                value === true ? this._map.provider : null
            );

            if (value === true) {
                this._markerClusterer.addMarkers(this._map.markersReady);
            } else {
                this._markerClusterer.clearMarkers();
                this._map.markers.forEach((marker) =>
                    marker.provider.setMap(this._map.provider)
                );
                this.repaint();
            }
            this._config.markerClustererActive = value;
        }

        public addMarker(marker: OSFramework.Marker.IMarker): void {
            if (this.isEnabled && marker.isReady) {
                // We need to make sure that a redraw is triggered whenever a new marker is added to the clusters
                this._markerClusterer.addMarker(marker.provider, false);
            }
        }

        public build(): void {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            //@ts-ignore
            this._markerClusterer = new MarkerClusterer(
                this._map.provider,
                this._map.markersReady,
                this._config.getProviderConfig()
            );
            // Make sure to repaint the whole clusters as soon as map tiles get loaded
            this._repaintOnTilesLoaded = google.maps.event.addListenerOnce(
                this._map.provider,
                'tilesloaded',
                this.repaint.bind(this)
            );
        }

        public changeProperty(
            propertyName: string,
            // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
            propertyValue: any
        ): void {
            const propValue =
                OSFramework.Enum.OS_Config_MarkerClusterer[propertyName];
            if (this._config.hasOwnProperty(propertyName)) {
                this._config[propertyName] = propertyValue;
            } else {
                this._map.mapEvents.trigger(
                    OSFramework.Event.OSMap.MapEventType.OnError,
                    this._map,
                    OSFramework.Enum.ErrorCodes
                        .GEN_InvalidChangePropertyMarkerClusterer,
                    `${propertyName}`
                );
            }

            // If the clusterer already exists, change its provider configs
            if (this.markerClusterer !== undefined) {
                switch (propValue) {
                    case OSFramework.Enum.OS_Config_MarkerClusterer
                        .markerClustererActive:
                        this._setState(propertyValue);
                        break;
                    case OSFramework.Enum.OS_Config_MarkerClusterer
                        .markerClustererMinClusterSize:
                        this._markerClusterer.setMinimumClusterSize(
                            propertyValue
                        );
                        break;
                    case OSFramework.Enum.OS_Config_MarkerClusterer
                        .markerClustererMaxZoom:
                        this._markerClusterer.setMaxZoom(propertyValue);
                        break;
                    case OSFramework.Enum.OS_Config_MarkerClusterer
                        .markerClustererZoomOnClick:
                        this._markerClusterer.setZoomOnClick(propertyValue);
                        break;
                }
                this.repaint();
            }
        }

        public dispose(): void {
            this._markerClusterer = undefined;
            // Remove the listeners associated to the cluster from a map provider
            google.maps.event.removeListener(this._repaintOnTilesLoaded);
        }

        public removeMarker(marker: OSFramework.Marker.IMarker): void {
            if (this.isEnabled && marker.isReady) {
                // We need to make sure that a redraw is triggered whenever a new marker is removed from the clusters
                this._markerClusterer?.removeMarker(marker.provider, false);
            }
        }

        public repaint(): void {
            this._markerClusterer.repaint();
        }
    }
}
