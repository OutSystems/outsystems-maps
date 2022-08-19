// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace Provider.Leaflet.Configuration.OSMap {
    export class LeafletMapConfig
        extends OSFramework.Maps.Configuration.AbstractConfiguration
        implements OSFramework.Maps.Configuration.IConfigurationMap
    {
        public center: string | OSFramework.Maps.OSStructures.OSMap.Coordinates;
        public height: string;
        public offset: OSFramework.Maps.OSStructures.OSMap.Offset;
        public uniqueId: string;
        public zoom: OSFramework.Maps.Enum.OSMap.Zoom;

        // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
        constructor(config: any) {
            super(config);
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        public getProviderConfig(): any {
            // eslint-disable-next-line prefer-const
            let provider = {
                center: this.center,
                zoom: this.zoom,
                // Let's make the map always editable to be able to later edit elements on the map
                editable: true
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
