/// <reference path="./BasicShapeConfig.ts" />

// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace Provider.Maps.Leaflet.Configuration.Shape {
    export class FilledShapeConfig extends BasicShapeConfig {
        public fillColor: string;
        public fillOpacity: number;

        constructor(
            config: OSFramework.Maps.Configuration.IConfigurationShape
        ) {
            super(config);
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        public getProviderConfig(): any {
            const provider = super.getProviderConfig();
            provider.fillColor = this.fillColor;
            provider.fillOpacity = this.fillOpacity;

            return provider;
        }
    }
}
