// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace Provider.Maps.Google.Configuration.MarkerClusterer {
    export class MarkerClustererConfig
        extends OSFramework.Maps.Configuration.AbstractConfiguration
        implements OSFramework.Maps.Configuration.IConfigurationMarkerClusterer
    {
        public clusterClass: string;
        public markerClustererActive: boolean;
        public markerClustererMaxZoom: number;
        public markerClustererMinClusterSize: number;
        public markerClustererZoomOnClick: boolean;
        public styles: Array<OSFramework.Maps.OSStructures.Clusterer.Style>;

        // No need for constructor, as it is not doing anything. Left the constructor, to facilitade future usage.
        // constructor(
        //     config: OSFramework.Maps.Configuration.IConfigurationMarkerClusterer
        // ) {
        //     super(config);
        // }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        public getProviderConfig(): any {
            // eslint-disable-next-line prefer-const
            let provider = {
                active: this.markerClustererActive,
                maxZoom: this.markerClustererMaxZoom || 2,
                minClusterSize: this.markerClustererMinClusterSize,
                zoomOnClick: this.markerClustererZoomOnClick,
                clusterClass:
                    OSFramework.Maps.Helper.Constants.clusterIconCSSClass,
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
