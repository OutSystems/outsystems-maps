/// <reference path="../../OSFramework/HeatmapLayer/AbstractHeatmapLayer.ts" />

// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace GoogleProvider.HeatmapLayer {
    export class HeatmapLayer extends OSFramework.HeatmapLayer
        .AbstractHeatmapLayer<
        google.maps.visualization.HeatmapLayer,
        OSFramework.Configuration.IConfigurationHeatmapLayer
    > {
        constructor(
            map: OSFramework.OSMap.IMap,
            HeatmapLayerId: string,
            // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
            configs: any
        ) {
            super(
                map,
                HeatmapLayerId,
                new Configuration.HeatmapLayer.HeatmapLayerConfig(configs)
            );
        }

        private _pointsToData() {
            const points = this.getProviderConfig().points;
            const data = points.map((point) => {
                return {
                    location: new google.maps.LatLng(point.Lat, point.Lng),
                    weight: point.Weight
                };
            });
            return data;
        }

        public build(): void {
            super.build();

            const configs = this.getProviderConfig();
            if(configs.gradient.length === 0) {
                delete configs.gradient;
            }

            // Creates the provider KMLLayer
            this._provider = new google.maps.visualization.HeatmapLayer({
                ...configs,
                data: this._pointsToData(),
                map: this.map.provider
            });

            this.finishBuild();
        }

        // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
        public changeProperty(propertyName: string, value: any): void {
            const propValue =
                OSFramework.Enum.OS_Config_HeatmapLayer[propertyName];
            super.changeProperty(propertyName, value);
            if (this.isReady) {
                switch (propValue) {
                    case OSFramework.Enum.OS_Config_HeatmapLayer
                        .dissipateOnZoom:
                        return this.provider.setOptions({
                            dissipating: value
                        });
                    case OSFramework.Enum.OS_Config_HeatmapLayer.gradient:
                        return this.provider.setOptions({
                            gradient: value
                        });
                    case OSFramework.Enum.OS_Config_HeatmapLayer.maxIntensity:
                        return this.provider.setOptions({
                            maxIntensity: value
                        });
                    case OSFramework.Enum.OS_Config_HeatmapLayer.opacity:
                        return this.provider.setOptions({
                            opacity: value
                        });
                    case OSFramework.Enum.OS_Config_HeatmapLayer.radius:
                        return this.provider.setOptions({
                            radius: value
                        });
                }
            }
        }

        public dispose(): void {
            if (this.isReady) {
                this.provider.set('map', null);
            }
            this._provider = undefined;
            super.dispose();
        }
    }
}
