// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace Provider.Maps.Google.Configuration.MarkerClusterer {
    export class MarkerClustererConfig
        extends OSFramework.Maps.Configuration.AbstractConfiguration
        implements OSFramework.Maps.Configuration.IConfigurationMarkerClusterer
    {
        private _map: Provider.Maps.Google.OSMap.IMapGoogle;
        private _renderer: GoogleClusterRenderer;
        public clusterClass: string;
        public markerClustererActive: boolean;
        public markerClustererMaxZoom: number;
        public markerClustererMinClusterSize: number;
        public markerClustererZoomOnClick: boolean;

        constructor(
            config: Configuration.MarkerClusterer.MarkerClustererConfig,
            map: Provider.Maps.Google.OSMap.IMapGoogle
        ) {
            super(config);
            this._map = map;
            this._renderer = new window.markerClusterer.DefaultRenderer();
        }

        public set renderer(renderer: OSFramework.Maps.Feature.IMarkerClustererRender) {
            if (renderer !== undefined) {
                this._renderer = renderer as GoogleClusterRenderer;
            } else {
                this._renderer = new window.markerClusterer.DefaultRenderer();
            }
        }

        public getProviderConfig(): MarkerClustererOptions {
            const minPoints = this.markerClustererActive ? this.markerClustererMinClusterSize : Number.MAX_SAFE_INTEGER;
            // eslint-disable-next-line prefer-const
            let provider = {
                algorithm: new window.markerClusterer.SuperClusterAlgorithm({
                    maxZoom: this.markerClustererMaxZoom || 2,
                    minPoints: minPoints,
                }),
                algorithmOptions: undefined,
                map: this._map.provider,
                markers: this._map.markersReady as google.maps.Marker[],
                onClusterClick: (event: google.maps.MapMouseEvent, cluster: Cluster, map: google.maps.Map) => {
                    if (this.markerClustererZoomOnClick) {
                        map.fitBounds(cluster.bounds);
                    }
                },
                renderer: this._renderer,
            };

            //Cleaning undefined properties
            Object.keys(provider).forEach((key) => {
                if (provider[key] === undefined) {
                    delete provider[key];
                }
            });

            return provider;
        }
    }
}
