// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace Provider.Maps.Google.Marker {
	export namespace MarkerFactory {
		export function MakeMarker(
			map: OSFramework.Maps.OSMap.IMap,
			markerId: string,
			type: OSFramework.Maps.Enum.MarkerType,
			configs: unknown
		): OSFramework.Maps.Marker.IMarker {
			const useAdvancedMarkers = (map as Provider.Maps.Google.OSMap.IMapGoogle).useAdvancedMarkers;

			let markerClass:
				| typeof Marker
				| typeof DeprecatedMarker
				| typeof MarkerPopup
				| typeof DeprecatedMarkerPopup;

			switch (type) {
				case OSFramework.Maps.Enum.MarkerType.Marker:
					markerClass = useAdvancedMarkers ? Marker : DeprecatedMarker;
					break;
				case OSFramework.Maps.Enum.MarkerType.MarkerPopup:
					markerClass = useAdvancedMarkers ? MarkerPopup : DeprecatedMarkerPopup;
					break;
				default:
					throw new Error(`There is no factory for this type of Marker (${type})`);
			}
			return new markerClass(map, markerId, type, configs);
		}
	}
}
