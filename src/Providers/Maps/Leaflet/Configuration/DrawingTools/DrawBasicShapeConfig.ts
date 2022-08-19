/// <reference path="./DrawConfig.ts" />

// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace Provider.Leaflet.Configuration.DrawingTools {
    export class DrawBasicShapeConfig extends DrawConfig {
        public allowEdit: boolean;
        public strokeColor: string;
        public strokeOpacity: number;
        public strokeWeight: number;

        constructor(
            config:
                | Configuration.DrawingTools.DrawFilledShapeConfig
                | Configuration.DrawingTools.DrawBasicShapeConfig
        ) {
            super(config);
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        public getProviderConfig(): any {
            const configs = super.getProviderConfig();
            // eslint-disable-next-line prefer-const
            let provider = {
                ...configs,
                shapeOptions: {
                    color: this.strokeColor,
                    opacity: this.strokeOpacity,
                    weight: this.strokeWeight
                }
            };

            //Deleting all the undefined properties
            Object.keys(provider).forEach((key) => {
                if (provider[key] === undefined) delete provider[key];
            });

            return provider;
        }
    }
}
