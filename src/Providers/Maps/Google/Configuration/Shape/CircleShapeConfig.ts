/// <reference path="./FilledShapeConfig.ts" />

// eslint-disable-next-line @typescript-eslint/no-unused-vars
<<<<<<<< HEAD:src/Providers/Maps/Google/Configuration/Shape/CircleShapeConfig.ts
namespace Provider.Maps.Google.Configuration.Shape {
========
namespace Provider.Maps.Leaflet.Configuration.Shape {
>>>>>>>> rc1.6.3:src/Providers/Maps/Leaflet/Configuration/Shape/CircleShapeConfig.ts
    export class CircleShapeConfig extends FilledShapeConfig {
        public center: string;
        public radius: number;

        // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
        constructor(config: any) {
            super(config);
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        public getProviderConfig(): any {
            const provider = super.getProviderConfig();
            provider.radius = this.radius;

            // Circle doesn't have locations on its configurations
            // We can remove it from the provider configs
            delete provider.locations;

            return provider;
        }
    }
}
