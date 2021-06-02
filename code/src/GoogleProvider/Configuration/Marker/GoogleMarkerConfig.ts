/// <reference path="../../../OSFramework/Configuration/AbstractConfiguration.ts" />

// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace GoogleProvider.Configuration.Marker {
    export class GoogleMarkerConfig
        extends OSFramework.Configuration.AbstractConfiguration
        implements OSFramework.Configuration.IConfigurationMarker {
        public advancedFormat: string;
        public allowDrag: boolean;
        public iconUrl: string;
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
                advancedFormat: this.advancedFormat,
                draggable: this.allowDrag,
                iconURL: this.iconUrl,
                location: this.location,
                title: this.title,
                uniqueId: this.uniqueId
            };

            //Deleting all the undefined properties
            Object.keys(provider).forEach((key) => {
                if (provider[key] === undefined) delete provider[key];
            });

            return provider;
        }
    }
}
