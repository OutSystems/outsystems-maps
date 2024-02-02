// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace Provider.Maps.Google.Feature {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    export class GoogleMarkerClusterer
        implements
            OSFramework.Maps.Feature.IMarkerClusterer,
            OSFramework.Maps.Interface.IBuilder,
            OSFramework.Maps.Interface.IDisposable
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
                    markerClustererConfigs,
                    this._map
                );
        }

        public get markerClusterer(): MarkerClusterer {
            return this._markerClusterer;
        }

        public get isEnabled(): boolean {
            return (
                this._config.markerClustererActive &&
                this._markerClusterer !== undefined
            );
        }

        private _rebuildClusters(): void {
            this._markerClusterer.clearMarkers();
            this._markerClusterer = undefined;
            this._markerClusterer = new window.markerClusterer.MarkerClusterer(this._config.getProviderConfig());
        }

        private _setState(value: boolean): void {
            this._markerClusterer.setMap(
                value === true ? this._map.provider : null
            );

            if (value === true) {
                this._markerClusterer.addMarkers(
                    this._map.markersReady as google.maps.Marker[]
                );
            } else {
                this._markerClusterer.clearMarkers();
                this._map.markers.forEach((marker) =>
                    marker.provider.setMap(this._map.provider)
                );
                this.repaint();
            }
        }

        public addMarker(marker: OSFramework.Maps.Marker.IMarker): void {
            if (this.isEnabled && marker.isReady) {
                // We need to make sure that a redraw is triggered whenever a new marker is added to the clusters
                this._markerClusterer.addMarker(marker.provider, false);
            }
        }

        public build(): void {
            this._markerClusterer = new window.markerClusterer.MarkerClusterer(this._config.getProviderConfig());

            // Make sure to repaint the whole clusters as soon as map tiles get loaded
            this._repaintOnTilesLoaded = google.maps.event.addListenerOnce(
                this._map.provider,
                'tilesloaded',
                this.repaint.bind(this)
            );
        }

        public changeProperty(propertyName: string, propertyValue: unknown): void {
            const propValue = OSFramework.Maps.Enum.OS_Config_MarkerClusterer[propertyName];
            if (this._config.hasOwnProperty(propertyName)) {
                this._config[propertyName] = propertyValue;
            } else {
                this._map.mapEvents.trigger(
                    OSFramework.Maps.Event.OSMap.MapEventType.OnError,
                    this._map,
                    OSFramework.Maps.Enum.ErrorCodes
                        .GEN_InvalidChangePropertyMarkerClusterer,
                    `${propertyName}`
                );
            }

            // If the clusterer already exists, change its provider configs
            if (this.markerClusterer !== undefined) {
                switch (propValue) {
                    case OSFramework.Maps.Enum.OS_Config_MarkerClusterer.markerClustererActive:
                        this._setState(propertyValue as boolean);
                        break;
                    case OSFramework.Maps.Enum.OS_Config_MarkerClusterer.markerClustererMinClusterSize:
                        this._rebuildClusters();
                        break;
                    case OSFramework.Maps.Enum.OS_Config_MarkerClusterer.markerClustererMaxZoom:
                        this._rebuildClusters();
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

        public removeMarker(marker: OSFramework.Maps.Marker.IMarker): void {
            if (this.isEnabled && marker.isReady) {
                // We need to make sure that a redraw is triggered whenever a new marker is removed from the clusters
                this._markerClusterer?.removeMarker(marker.provider, false);
            }
        }

        public repaint(): void {
            this._markerClusterer.render();
        }

        public setClusterRenderer(renderer: OSFramework.Maps.Feature.IMarkerClustererRender) {
            this._config.renderer = renderer;
            if(this.isEnabled) {
                this._rebuildClusters();
            }
        }
    }
}
