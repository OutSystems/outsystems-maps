/// <reference path="./FilledShapeConfig.ts" />

// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace Provider.Maps.Google.Configuration.Shape {
    export class CircleShapeConfig extends FilledShapeConfig {
        public center: string;
        public radius: number;

        constructor(config: unknown) {
            super(config);
        }

        public getProviderConfig(): IShapeProviderConfig {
            const provider = super.getProviderConfig();
            provider.radius = this.radius;

            // Circle doesn't have locations on its configurations
            // We can remove it from the provider configs
            delete provider.locations;

            return provider;
        }
    }
}
