// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace Provider.Maps.Google.Helper.TypeChecker {
	/**
	 * Validates if a marker is an AdvancedMarkerElement
	 *
	 * @export
	 * @param {unknown} marker Marker to validate
	 * @return {*}  {boolean} True if the marker is an AdvancedMarkerElement, false otherwise
	 *
	 */
	export function IsAdvancedMarker(marker: unknown): boolean {
		return marker instanceof google.maps.marker.AdvancedMarkerElement;
	}

	/**
	 * Validates if a string is a set of coordinates
	 *
	 * @export
	 * @param {string} coordinates Coordinates to validate
	 * @return {*}  {boolean} True if the coordinates are valid, false otherwise
	 *
	 */
	export function IsValidCoordinates(coordinates: string): boolean {
		return Constants.coordinateValidator.test(coordinates);
	}
}
