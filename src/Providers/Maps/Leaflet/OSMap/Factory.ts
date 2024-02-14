// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace Provider.Maps.Leaflet.OSMap {
	export namespace MapFactory {
		export function MakeMap(
			type: OSFramework.Maps.Enum.MapType,
			mapdId: string,
			configs: JSON
		): OSFramework.Maps.OSMap.IMap {
			switch (type) {
				case OSFramework.Maps.Enum.MapType.Map:
					return new Map(mapdId, configs);
				//Right now there is no StaticMap for the Leaflet provider
				case OSFramework.Maps.Enum.MapType.StaticMap:
				default:
					throw new Error(`There is no factory for this type of Map (${type})`);
			}
		}
	}
}
