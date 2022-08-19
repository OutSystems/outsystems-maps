// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace Provider.Google.Configuration.OSMap {
    export class GoogleStaticMapConfig
        extends OSFramework.Maps.Configuration.AbstractConfiguration
        implements OSFramework.Maps.Configuration.IConfigurationMap
    {
        public apiKey: string;
        public center: string | OSFramework.Maps.OSStructures.OSMap.Coordinates;
        public height: string;
        public type: OSFramework.Maps.Enum.OSMap.Type;
        public uniqueId: string;
        public zoom: OSFramework.Maps.Enum.OSMap.Zoom;

        // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
        constructor(config: any) {
            super(config);
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        public getProviderConfig(): any {
            const provider = {
                center: this.center,
                zoom: this.zoom,
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
