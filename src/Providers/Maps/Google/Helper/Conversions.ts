// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace Provider.Maps.Google.Helper.Conversions {
	/**
	 * GoogleMaps API used to get the coordinates based on the location (address)
	 *
	 * @param location Location to convert to coordinates
	 * @param apiKey Google API Key
	 * @returns Promise that will retrieve the coordinates
	 */
	const googleMapsApiGeocode = function (location: string): Promise<OSFramework.Maps.OSStructures.OSMap.Coordinates> {
		// Encodes a location string into a valid format
		const geo = new google.maps.Geocoder();

		return new Promise<OSFramework.Maps.OSStructures.OSMap.Coordinates>((resolve, reject) => {
			geo.geocode(
				{ address: location },
				(results: google.maps.GeocoderResult[], status: google.maps.GeocoderStatus) => {
					if (status === google.maps.GeocoderStatus.OK) {
						const loc = results[0].geometry.location;
						resolve({ lat: loc.lat(), lng: loc.lng() });
					} else if (status === google.maps.GeocoderStatus.ZERO_RESULTS) {
						console.warn(`No results have been found for address "${location}".`);
						reject('No results have been found.');
					} else if (status === google.maps.GeocoderStatus.OVER_QUERY_LIMIT) {
						reject('Google Maps API call limit exceeded. Please wait a few moments and try again');
					} else {
						reject(status);
					}
				}
			);
		});
	};
	/**
	 * Promise that will retrive the coordinates for a specific location via Google Maps API
	 *
	 * @param location Location to convert to coordinates
	 * @param apiKey Google API Key
	 * @returns Promise that will retrieve the coordinates
	 */
	export function ConvertToCoordinates(location: string): Promise<OSFramework.Maps.OSStructures.OSMap.Coordinates> {
		if (location === undefined || location.trim().length === 0) {
			console.warn(
				'Invalid location. Using the default location -> 55 Thomson Pl 2nd floor, Boston, MA 02210, United States'
			);
			return Promise.resolve(OSFramework.Maps.Helper.Constants.defaultMapCenter);
		}

		// If the provided location is a set of coordinates
		if (Helper.TypeChecker.IsValidCoordinates(location)) {
			// split the coordinates into latitude and longitude
			if (location.indexOf(',') > -1) {
				return Promise.resolve(GetCoordinatesFromString(location));
			} else {
				// Try to get the address via the googleMapsAPIGeocode
				return googleMapsApiGeocode(location);
			}
		}
		// If the location is an address try to get the address via the googleMapsAPIGeocode
		else {
			return googleMapsApiGeocode(location);
		}
	}

	/**
	 * Converts a string with coordinates into a google.maps.LatLngLiteral object.
	 *
	 * @export
	 * @param {string} coordinates
	 * @return {*}  {google.maps.LatLngLiteral}
	 */
	export function GetCoordinatesFromString(coordinates: string): google.maps.LatLngLiteral {
		let latitude: number;
		let longitude: number;
		// split the coordinates into latitude and longitude
		if (coordinates.indexOf(',') > -1) {
			latitude = parseFloat(coordinates.split(',')[0].replace(' ', ''));
			longitude = parseFloat(coordinates.split(',')[1].replace(' ', ''));

			return { lat: latitude, lng: longitude };
		} else {
			return { lat: 0, lng: 0 };
		}
	}

	/**
	 * Get the value of a coordinate, if it is a function, call it and get the value
	 *
	 * @export
	 * @param {((()=>number) | number)} coordinate Coordinate to get the value from
	 * @return {*}  {number} Value of the coordinate
	 */
	export function GetCoordinateValue(coordinate: (() => number) | number): number {
		return typeof coordinate === 'function' ? coordinate() : coordinate;
	}
}
