// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace Provider.Google.HeatmapLayer {
    export namespace HeatmapLayerFactory {
        export function MakeHeatmapLayer(
            map: OSFramework.OSMap.IMap,
            heatmapLayerId: string,
            configs: OSFramework.Configuration.IConfiguration
        ): OSFramework.HeatmapLayer.IHeatmapLayer {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            return new HeatmapLayer(
                map,
                heatmapLayerId,
                configs as Configuration.HeatmapLayer.HeatmapLayerConfig
            );
        }
    }
}
