// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace Provider.Maps.Leaflet.OSMap {
	/**
	 * Factory that will create the correct Map object based on the type passed.
	 *
	 * @namespace MapFactory
	 */
	export namespace MapFactory {
		/**
		 * Function that will create the correct Map object based on the type passed.
		 *
		 * @param type Type of the Map
		 * @param mapdId Id of the Map
		 * @param configs Configurations of the Map
		 * @returns Map object
		 */
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
