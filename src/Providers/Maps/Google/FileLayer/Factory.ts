// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace Provider.Maps.Google.FileLayer {
    export namespace FileLayerFactory {
        export function MakeFileLayer(
            map: OSFramework.Maps.OSMap.IMap,
            fileLayerId: string,
            configs: OSFramework.Maps.Configuration.IConfiguration
        ): OSFramework.Maps.FileLayer.IFileLayer {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            return new FileLayer(
                map,
                fileLayerId,
                configs as Configuration.FileLayer.FileLayerConfig
            );
        }
    }
}
