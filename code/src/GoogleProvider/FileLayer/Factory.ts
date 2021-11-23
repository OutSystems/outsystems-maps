// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace GoogleProvider.FileLayer {
    export namespace FileLayerFactory {
        export function MakeFileLayer(
            map: OSFramework.OSMap.IMap,
            fileLayerId: string,
            configs: OSFramework.Configuration.IConfiguration
        ): OSFramework.FileLayer.IFileLayer {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            return new FileLayer(
                map,
                fileLayerId,
                configs as Configuration.FileLayer.FileLayerConfig
            );
        }
    }
}
