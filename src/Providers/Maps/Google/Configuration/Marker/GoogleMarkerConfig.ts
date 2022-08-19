/// <reference path="../../../../OSFramework/Configuration/AbstractConfiguration.ts" />

// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace Provider.Maps.Google.Configuration.Marker {
    export class GoogleMarkerConfig
        extends OSFramework.Maps.Configuration.AbstractConfiguration
        implements OSFramework.Maps.Configuration.IConfigurationMarker
    {
        public allowDrag: boolean;
        public iconHeight: number;
        public iconUrl: string;
        public iconWidth: number;
        public label: string;
        public location: string;
        public title: string;

        // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
        constructor(config: any) {
            super(config);
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        public getProviderConfig(): any {
            const provider = {
                draggable: this.allowDrag,
                icon: this.iconUrl,
                label: this.label,
                location: this.location,
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
