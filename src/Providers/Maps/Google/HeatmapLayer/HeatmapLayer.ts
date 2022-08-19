/// <reference path="../../../OSFramework/HeatmapLayer/AbstractHeatmapLayer.ts" />

// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace Provider.Google.HeatmapLayer {
    export type data = {
        location: google.maps.LatLng;
        weight: number;
    };
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

        /** In case the gradient is not defined, use the default from GoogleProvider */
        private _gradientColors(gradient: string[]) {
            if (gradient.length === 0) {
                return OSFramework.Helper.Constants.gradientHeatmapColors;
            }
            return gradient;
        }

        /** Convert array of points from OS format into the data points from GoogleProvider */
        private _pointsToData(
            points: Array<OSFramework.OSStructures.HeatmapLayer.Points>
        ) {
            const data: Array<HeatmapLayer.data | google.maps.LatLng> =
                points.map((point) => {
                    if (point.Weight === undefined) {
                        return new google.maps.LatLng(point.Lat, point.Lng);
                    }
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

            // Creates the provider HeatmapLayer
            this._provider = new google.maps.visualization.HeatmapLayer({
                ...configs,
                // first we need to convert the points from OS format to data GoogleProvider format
                data: this._pointsToData(configs.points),
                // then, we need to make sure if the gradient is empty, we set it with the GoogleProvider default values
                gradient: this._gradientColors(configs.gradient),
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
                    case OSFramework.Enum.OS_Config_HeatmapLayer.points:
                        return this.provider.setData(
                            this._pointsToData(JSON.parse(value))
                        );
                    case OSFramework.Enum.OS_Config_HeatmapLayer
                        .dissipateOnZoom:
                        return this.provider.setOptions({
                            dissipating: value
                        });
                    case OSFramework.Enum.OS_Config_HeatmapLayer.gradient:
                        return this.provider.setOptions({
                            gradient: this._gradientColors(JSON.parse(value))
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
