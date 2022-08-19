/// <reference path="../../../../OSFramework/Configuration/AbstractConfiguration.ts" />

// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace Provider.Maps.Google.Configuration.Shape {
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
        public uniqueId: string;

        // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
        constructor(config: any) {
            super(config);
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        public getProviderConfig(): any {
            // eslint-disable-next-line prefer-const
            let provider = {
                clickable: true,
                draggable: this.allowDrag,
                editable: this.allowEdit,
                strokeOpacity: this.strokeOpacity,
                strokeColor: this.strokeColor,
                strokeWeight: this.strokeWeight
            };

            //Deleting all the undefined properties
            Object.keys(provider).forEach((key) => {
                if (provider[key] === undefined) delete provider[key];
            });

            return provider;
        }
    }
}
