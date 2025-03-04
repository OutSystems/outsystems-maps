// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace Provider.Maps.Google.Helper.TypeChecker {
	export function IsAdvancedMarker(marker: unknown): boolean {
		return marker instanceof google.maps.marker.AdvancedMarkerElement;
	}
}
