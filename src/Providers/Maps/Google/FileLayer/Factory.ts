// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace Provider.Maps.Google.FileLayer {
    export namespace FileLayerFactory {
        export function MakeFileLayer(
            map: OSFramework.Maps.OSMap.IMap,
            fileLayerId: string,
            configs: JSON
        ): OSFramework.Maps.FileLayer.IFileLayer {
            return new FileLayer(map, fileLayerId, configs);
        }
    }
}
