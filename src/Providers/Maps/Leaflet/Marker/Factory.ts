// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace Provider.Maps.Leaflet.Marker {
	/**
	 * Factory that will create the correct Marker object based on the type passed.
	 *
	 * @namespace MarkerFactory
	 */
	export namespace MarkerFactory {
		/**
		 * Function that will create the correct Marker object based on the type passed.
		 *
		 * @param map Map that the Marker will be added to
		 * @param markerId Id of the Marker
		 * @param type Type of the Marker
		 * @param configs Configurations of the Marker
		 * @returns Marker object
		 */
		export function MakeMarker(
			map: OSFramework.Maps.OSMap.IMap,
			markerId: string,
			type: OSFramework.Maps.Enum.MarkerType,
			configs: JSON | OSFramework.Maps.Configuration.IConfigurationMarker
		): OSFramework.Maps.Marker.IMarker {
			switch (type) {
				case OSFramework.Maps.Enum.MarkerType.Marker:
					return new Marker(map, markerId, type, configs);
				case OSFramework.Maps.Enum.MarkerType.MarkerPopup:
					return new MarkerPopup(map, markerId, type, configs);
				default:
					throw new Error(`There is no factory for this type of Marker (${type})`);
			}
		}
	}
}
