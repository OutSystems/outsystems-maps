/// <reference path="../../../OSFramework/Configuration/AbstractConfiguration.ts" />

// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace GoogleProvider.Configuration.Shape {
    export class GoogleShapeConfig
        extends OSFramework.Configuration.AbstractConfiguration
        implements OSFramework.Configuration.IConfigurationShape {
        public allowDrag: boolean;
        public allowEdit: boolean;
        public color: string;
        public locations: string;
        public opacity: number;
        public uniqueId: string;
        public weight: number;

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
                strokeOpacity: this.opacity,
                strokeColor: this.color,
                strokeWeight: this.weight
            };

            //Deleting all the undefined properties
            Object.keys(provider).forEach((key) => {
                if (provider[key] === undefined) delete provider[key];
            });

            return provider;
        }
    }
}
