/// <reference path="./FilledShapeConfig.ts" />

// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace LeafletProvider.Configuration.Shape {
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
