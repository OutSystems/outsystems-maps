// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace Provider.Maps.Google.Configuration.OSMap {
    export class GoogleMapConfig
        extends OSFramework.Maps.Configuration.AbstractConfiguration
        implements OSFramework.Maps.Configuration.IConfigurationMap
    {
        public advancedFormat: string;
        public apiKey: string;
        public autoZoomOnShapes: boolean;
        public center: string | OSFramework.Maps.OSStructures.OSMap.Coordinates;
        public height: string;
        public markerClusterer: OSFramework.Maps.Configuration.IConfigurationMarkerClusterer;
        public offset: OSFramework.Maps.OSStructures.OSMap.Offset;
        public respectUserZoom: boolean;
        public showTraffic: boolean;
        public style: OSFramework.Maps.Enum.OSMap.Style;
        public type: OSFramework.Maps.Enum.OSMap.Type;
        public uniqueId: string;
        public zoom: OSFramework.Maps.Enum.OSMap.Zoom;

        // No need for constructor, as it is not doing anything. Left the constructor, to facilitade future usage.
        // constructor(config: JSON) {
        //     super(config);
        // }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        public getProviderConfig(): any {
            const provider = {
                center: this.center,
                zoom: this.zoom,
                styles: this.style,
                mapTypeId: this.type
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
