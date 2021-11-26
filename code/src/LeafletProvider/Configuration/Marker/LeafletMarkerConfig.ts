/// <reference path="../../../OSFramework/Configuration/AbstractConfiguration.ts" />

// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace LeafletProvider.Configuration.Marker {
    export class LeafletMarkerConfig
        extends OSFramework.Configuration.AbstractConfiguration
        implements OSFramework.Configuration.IConfigurationMarker
    {
        public allowDrag: boolean;
        public iconHeight: number;
        public iconUrl: string;
        public iconWidth: number;
        public label: string;
        public location: string;
        public title: string;
        public uniqueId: string;

        // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
        constructor(config: any) {
            super(config);
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        public getProviderConfig(): any {
            // eslint-disable-next-line prefer-const
            let provider = {
                draggable: this.allowDrag,
                iconUrl: this.iconUrl,
                label: this.label,
                title: this.title
            };

            //Deleting all the undefined properties
            Object.keys(provider).forEach((key) => {
                if (provider[key] === undefined) delete provider[key];
            });

            return provider;
        }
    }
}
