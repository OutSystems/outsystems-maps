// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace GoogleProvider.Feature {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    export class GoogleMarkerClusterer
        implements
            OSFramework.Feature.IMarkerClusterer,
            OSFramework.Interface.IBuilder,
            OSFramework.Interface.IDisposable
    {
        private _map: OSMap.IMapGoogle;
        private _markerClusterOptions: OSFramework.OSStructures.OSMap.MarkerClusterer;
        private _markerClusterer: MarkerClusterer;
        private _repaintOnTilesLoaded: google.maps.MapsEventListener;

        constructor(
            map: OSMap.IMapGoogle,
            markerClustererConfigs: OSFramework.OSStructures.OSMap.MarkerClusterer
        ) {
            this._map = map;
            // Set the clusterer configs
            this.setMarkerClusterer(markerClustererConfigs);
        }

        public get markerClusterer(): MarkerClusterer {
            return this._markerClusterer;
        }

        public get isEnabled(): boolean {
            return this._markerClusterOptions.active;
        }

        private _changeProperty(
            propertyName: string,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            propertyValue: any
        ): void {
            const propValue =
                OSFramework.Enum.OS_Config_MarkerClusterer[propertyName];
            switch (propValue) {
                case OSFramework.Enum.OS_Config_MarkerClusterer.active:
                    return this._setState(propertyValue);
                case OSFramework.Enum.OS_Config_MarkerClusterer.minClusterSize:
                    return this._markerClusterer.setMinimumClusterSize(
                        propertyValue
                    );
                case OSFramework.Enum.OS_Config_MarkerClusterer.maxZoom:
                    return this._markerClusterer.setMaxZoom(propertyValue);
                case OSFramework.Enum.OS_Config_MarkerClusterer.zoomOnClick:
                    return this._markerClusterer.setZoomOnClick(propertyValue);
            }
        }

        private _setConfigs(
            configs: OSFramework.OSStructures.OSMap.MarkerClusterer
        ): void {
            this._markerClusterOptions = {
                active: configs.active,
                maxZoom: configs.maxZoom || 2,
                minClusterSize: configs.minClusterSize,
                zoomOnClick: configs.zoomOnClick,
                clusterClass: 'custom-clustericon',
                styles: ClustererStyle
            };
        }

        private _setState(value: boolean): void {
            this._markerClusterer.setMap(
                value === true ? this._map.provider : null
            );
            this._markerClusterOptions.active = value;
        }

        public addMarker(marker: OSFramework.Marker.IMarker): void {
            if (this.isEnabled && marker.isReady) {
                // We need to make sure that a redraw is triggered whenever a new marker is added to the clusters
                this._markerClusterer.addMarker(marker.provider, false);
            }
        }

        public build(): void {
            return;
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            //@ts-ignore
            this._markerClusterer = new MarkerClusterer(
                this._map.provider,
                this._map.markersReady,
                this._markerClusterOptions
            );
            // Make sure to repaint the whole clusters as soon as map tiles get loaded
            this._repaintOnTilesLoaded = google.maps.event.addListenerOnce(
                this._map.provider,
                'tilesloaded',
                this.repaint.bind(this)
            );
        }

        public dispose(): void {
            this._markerClusterer = undefined;
            // Remove the listeners associated to the cluster from a map provider
            google.maps.event.removeListener(this._repaintOnTilesLoaded);
        }

        public repaint(): void {
            this._markerClusterer.repaint();
        }

        public setMarkerClusterer(
            configs: OSFramework.OSStructures.OSMap.MarkerClusterer
        ): void {
            if (configs === undefined) {
                return;
            }
            this._setConfigs(configs);

            // If the clusterer already exists, change its provider configs
            if (this._markerClusterer) {
                Object.keys(configs).forEach((key) => {
                    this._changeProperty(key, configs[key]);
                });
                this.repaint();
            }
        }
    }
}
