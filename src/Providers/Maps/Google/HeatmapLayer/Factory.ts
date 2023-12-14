// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace Provider.Maps.Google.HeatmapLayer {
    export namespace HeatmapLayerFactory {
        export function MakeHeatmapLayer(
            map: OSFramework.Maps.OSMap.IMap,
            heatmapLayerId: string,
            configs: JSON
        ): OSFramework.Maps.HeatmapLayer.IHeatmapLayer {
            return new HeatmapLayer(map, heatmapLayerId, configs);
        }
    }
}
