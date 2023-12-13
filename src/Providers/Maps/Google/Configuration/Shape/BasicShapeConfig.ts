/// <reference path="../../../../../OSFramework/Maps/Configuration/AbstractConfiguration.ts" />

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

        // No need for constructor, as it is not doing anything. Left the constructor, to facilitade future usage.
        // constructor(config: unknown) {
        //     super(config);
        // }

        public getProviderConfig(): IShapeProviderConfig {
            // eslint-disable-next-line prefer-const
            let provider: IShapeProviderConfig = {
                clickable: true,
                draggable: this.allowDrag,
                editable: this.allowEdit,
                strokeColor: this.strokeColor,
                strokeOpacity: this.strokeOpacity,
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
