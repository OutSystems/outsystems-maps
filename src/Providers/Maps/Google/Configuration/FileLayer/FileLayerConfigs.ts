/// <reference path="../../../../../OSFramework/Maps/Configuration/AbstractConfiguration.ts" />

// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace Provider.Maps.Google.Configuration.FileLayer {
    export class FileLayerConfig
        extends OSFramework.Maps.Configuration.AbstractConfiguration
        implements OSFramework.Maps.Configuration.IConfigurationFileLayer
    {
        public layerUrl: string;
        public preserveViewport: boolean;
        public suppressPopups: boolean;

        // No need for constructor, as it is not doing anything. Left the constructor, to facilitade future usage.
        // constructor(config: JSON) {
        //     super(config);
        // }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        public getProviderConfig(): any {
            // eslint-disable-next-line prefer-const
            let provider = {
                clickable: true,
                url: this.layerUrl,
                preserveViewport: this.preserveViewport,
                suppressInfoWindows: this.suppressPopups
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
