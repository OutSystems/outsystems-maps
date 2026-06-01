// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace OSFramework.Maps.FileLayer {
	export namespace FileLayerFactory {
		export function MakeFileLayer(
			map: OSMap.IMap,
			fileLayerId: string,
			configs: JSON,
			useDeckglLoader: boolean = true
		): IFileLayer {
			let fileLayerBuilder: (
				map: OSMap.IMap,
				fileLayerId: string,
				configs: JSON
			) => OSFramework.Maps.FileLayer.IFileLayer;

			if (map.providerType === Enum.ProviderType.Google) {
				if (useDeckglLoader) {
					fileLayerBuilder = Provider.Layers.deckgl.FileLayer.FileLayerFactory.MakeFileLayer;
				} else {
					fileLayerBuilder = Provider.Maps.Google.FileLayer.FileLayerFactory.MakeFileLayer;
				}
			} else {
				throw new Error(`There is no factory for the FileLayer using the provider ${map.providerType}`);
			}

			return fileLayerBuilder(map, fileLayerId, configs) as IFileLayer;
		}
	}
}
