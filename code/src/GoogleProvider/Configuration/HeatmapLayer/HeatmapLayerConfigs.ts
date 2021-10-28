/// <reference path="../../../OSFramework/Configuration/AbstractConfiguration.ts" />

// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace GoogleProvider.Configuration.HeatmapLayer {
    export class HeatmapLayerConfig
        extends OSFramework.Configuration.AbstractConfiguration
        implements OSFramework.Configuration.IConfigurationHeatmapLayer
    {
        public dissipateOnZoom: boolean;
        public gradient: Array<string>;
        public maxIntensity: number;
        public opacity: number;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        public points: Array<any>;
        public radius: number;

        // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
        constructor(config: any) {
            super(config);
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        public getProviderConfig(): any {
            // eslint-disable-next-line prefer-const
            let provider = {
                points: this.points,
                dissipate: this.dissipateOnZoom,
                gradient: this.gradient,
                maxIntensity: this.maxIntensity,
                opacity: this.opacity,
                radius: this.radius
            };

            //Cleanning undefined properties
            Object.keys(provider).forEach((key) => {
                if (provider[key] === undefined) {
                    delete provider[key];
                }
            });

            return provider;
        }
    }
}
