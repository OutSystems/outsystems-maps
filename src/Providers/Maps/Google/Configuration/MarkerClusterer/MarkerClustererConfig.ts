// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace Provider.Google.Configuration.MarkerClusterer {
    export class MarkerClustererConfig
        extends OSFramework.Configuration.AbstractConfiguration
        implements OSFramework.Configuration.IConfigurationMarkerClusterer
    {
        public clusterClass: string;
        public markerClustererActive: boolean;
        public markerClustererMaxZoom: number;
        public markerClustererMinClusterSize: number;
        public markerClustererZoomOnClick: boolean;
        public styles: Array<OSFramework.OSStructures.Clusterer.Style>;

        // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
        constructor(config: any) {
            super(config);
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        public getProviderConfig(): any {
            // eslint-disable-next-line prefer-const
            let provider = {
                active: this.markerClustererActive,
                maxZoom: this.markerClustererMaxZoom || 2,
                minClusterSize: this.markerClustererMinClusterSize,
                zoomOnClick: this.markerClustererZoomOnClick,
                clusterClass: OSFramework.Helper.Constants.clusterIconCSSClass,
                styles: ClustererStyle
            };

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
