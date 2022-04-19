/// <reference path="./BasicShapeConfig.ts" />

// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace Provider.Google.Configuration.Shape {
    export class FilledShapeConfig extends BasicShapeConfig {
        public fillColor: string;
        public fillOpacity: number;

        // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
        constructor(config: any) {
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
