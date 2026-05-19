namespace Provider.Layers.deckgl.FileLayer.FileLayerFactory {
	export function MakeFileLayer(
		map: OSFramework.Maps.OSMap.IMap,
		fileLayerId: string,
		configs: JSON
	): OSFramework.Maps.FileLayer.IFileLayer {
		return new FileLayer(map, fileLayerId, configs);
	}
}
