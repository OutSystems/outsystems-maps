// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace GoogleProvider.Configuration.OSMap {
    export class GoogleStaticMapConfig
        extends OSFramework.Configuration.AbstractConfiguration
        implements OSFramework.Configuration.IConfigurationMap {
        public advancedFormat: string;
        public apiKey: string;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        public center: any;
        public height: string;
        public style: OSFramework.Enum.OSMap.Style;
        public type: OSFramework.Enum.OSMap.Type;
        public uniqueId: string;
        public zoom: OSFramework.Enum.OSMap.Zoom;

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
