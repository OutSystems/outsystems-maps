// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace Provider.Maps.Google.Configuration.MarkerClusterer {
    export class MarkerClustererConfig
        extends OSFramework.Maps.Configuration.AbstractConfiguration
        implements OSFramework.Maps.Configuration.IConfigurationMarkerClusterer
    {
        private _map: Provider.Maps.Google.OSMap.IMapGoogle;
        public clusterClass: string;
        public markerClustererActive: boolean;
        public markerClustererMaxZoom: number;
        public markerClustererMinClusterSize: number;
        public markerClustererZoomOnClick: boolean;
        public styles: Array<OSFramework.Maps.OSStructures.Clusterer.Style>;
		
        constructor(
            config: OSFramework.Maps.Configuration.IConfigurationMarkerClusterer,
            map: Provider.Maps.Google.OSMap.IMapGoogle
        ) {
            super(config);
			this._map = map;
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
				markers: this._map.markersReady,
				onClusterClick: (event: google.maps.MapMouseEvent, cluster: Cluster, map: google.maps.Map) => {
					if (this.markerClustererZoomOnClick) {
						map.fitBounds(cluster.bounds);
					}
				},
				renderer: new window.markerClusterer.DefaultRenderer(),
            };
            //✅ active: this.markerClustererActive,
            //✅ maxZoom: this.markerClustererMaxZoom || 2,
            //✅ minClusterSize: this.markerClustererMinClusterSize,
            //✅ zoomOnClick: this.markerClustererZoomOnClick,
            // clusterClass: OSFramework.Maps.Helper.Constants.clusterIconCSSClass,
            // styles: ClustererStyle,

            //Cleanning undefined properties
            Object.keys(provider).forEach((key) => {
                if (provider[key] === undefined) {
                    delete provider[key];
                }
            });

            return provider;
        }
    }
}
