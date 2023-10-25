/// <reference path="../../../../../OSFramework/Maps/Configuration/AbstractConfiguration.ts" />

// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace Provider.Maps.Leaflet.Configuration.Shape {
    export class BasicShapeConfig
        extends OSFramework.Maps.Configuration.AbstractConfiguration
        implements OSFramework.Maps.Configuration.IConfigurationShape
    {
        public allowDrag: boolean;
        public allowEdit: boolean;
        public locations: string;
        public strokeColor: string;
        public strokeOpacity: number;
        public strokeWeight: number;

        constructor(
            config: OSFramework.Maps.Configuration.IConfigurationShape
        ) {
            super(config);
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        public getProviderConfig(): any {
            const provider = {
                // Always have the draggable property enabled in order to create the dragging instance
                // The allowDrag property will take care of the feature enablement and disablement
                draggable: true,
                editable: false, //the allowEdit property will take care of the feature. Always maintain this parameter false to use drawing
                opacity: this.strokeOpacity,
                color: this.strokeColor,
                weight: this.strokeWeight
            };

            //Deleting all the undefined properties
            Object.keys(provider).forEach((key) => {
                if (provider[key] === undefined) delete provider[key];
            });

            return provider;
        }
    }
}
