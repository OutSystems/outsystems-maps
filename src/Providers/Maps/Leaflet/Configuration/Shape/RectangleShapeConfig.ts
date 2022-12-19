/// <reference path="./FilledShapeConfig.ts" />

// eslint-disable-next-line @typescript-eslint/no-unused-vars
<<<<<<<< HEAD:src/Providers/Maps/Leaflet/Configuration/Shape/RectangleShapeConfig.ts
namespace Provider.Maps.Leaflet.Configuration.Shape {
========
namespace Provider.Maps.Google.Configuration.Shape {
>>>>>>>> rc1.6.3:src/Providers/Maps/Google/Configuration/Shape/RectangleShapeConfig.ts
    export class RectangleShapeConfig extends FilledShapeConfig {
        public bounds: string;

        // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
        constructor(config: any) {
            super(config);
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        public getProviderConfig(): any {
            const provider = super.getProviderConfig();

            // Rectangle doesn't have locations on its configurations
            // We can remove it from the provider configs
            delete provider.locations;

            return provider;
        }
    }
}
