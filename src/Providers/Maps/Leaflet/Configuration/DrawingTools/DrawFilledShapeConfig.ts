/// <reference path="./DrawBasicShapeConfig.ts" />

// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace Provider.Maps.Leaflet.Configuration.DrawingTools {
    export class DrawFilledShapeConfig extends DrawBasicShapeConfig {
        public fillColor: string;
        public fillOpacity: number;

        // No need for constructor, as it is not doing anything. Left the constructor, to facilitade future usage.
        // constructor(config: JSON) {
        //     super(config);
        // }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        public getProviderConfig(): any {
            // eslint-disable-next-line prefer-const
            let provider = super.getProviderConfig();

            provider.shapeOptions.fillColor = this.fillColor;
            provider.shapeOptions.fillOpacity = this.fillOpacity;

            //Deleting all the undefined properties
            Object.keys(provider).forEach((key) => {
                if (provider[key] === undefined) delete provider[key];
            });

            return provider;
        }
    }
}
