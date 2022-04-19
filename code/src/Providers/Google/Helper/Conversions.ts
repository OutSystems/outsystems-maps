// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace Provider.Google.Helper.Conversions {
    /**
     * GoogleMaps API used to get the coordinates based on the location (address)
     *
     * @param location Location to convert to coordinates
     * @param apiKey Google API Key
     * @returns Promise that will retrieve the coordinates
     */
    const googleMapsApiGeocode = function (
        location: string,
        apiKey: string
    ): Promise<OSFramework.OSStructures.OSMap.Coordinates> {
        // Encodes a location string into a valid format
        location = encodeURIComponent(location);
        return fetch(
            `${OSFramework.Helper.Constants.googleMapsApiGeocode}?address=${location}&key=${apiKey}`
        )
            .then((response) => {
                if (response.ok) {
                    return response.json();
                } else {
                    throw new Error("Server response wasn't OK");
                }
            })
            .then((json) => {
                if (json.results.length === 0) {
                    throw new Error(
                        json.error_message ?? 'No results have been found.'
                    );
                }
                const loc = json.results[0].geometry.location;
                return { lat: loc.lat, lng: loc.lng };
            });
    };
    /**
     * Promise that will retrive the coordinates for a specific location via Google Maps API
     *
     * @param location Location to convert to coordinates
     * @param apiKey Google API Key
     * @returns Promise that will retrieve the coordinates
     */
    export function ConvertToCoordinates(
        location: string,
        apiKey: string
    ): Promise<OSFramework.OSStructures.OSMap.Coordinates> {
        if (location === undefined || location.trim().length === 0) {
            console.warn(
                'Invalid location. Using the default location -> 55 Thomson Pl 2nd floor, Boston, MA 02210, United States'
            );
            return new Promise((resolve) => {
                resolve(OSFramework.Helper.Constants.defaultMapCenter);
            });
        }

        // Regex that validates if string is a set of coordinates
        // Accepts "12.300,-8.220" and "12.300, -8.220"
        const regexValidator = /^-{0,1}\d*\.{0,1}\d*,( )?-{0,1}\d*\.{0,1}\d*$/;
        // If the provided location is a set of coordinates
        if (regexValidator.test(location)) {
            let latitude: number;
            let longitude: number;
            // split the coordinates into latitude and longitude
            if (location.indexOf(',') > -1) {
                latitude = parseFloat(location.split(',')[0].replace(' ', ''));
                longitude = parseFloat(location.split(',')[1].replace(' ', ''));

                return new Promise((resolve) => {
                    resolve({ lat: latitude, lng: longitude });
                });
            } else {
                // Try to get the address via the googleMapsAPIGeocode
                return googleMapsApiGeocode(location, apiKey);
            }
        }
        // If the location is an address try to get the address via the googleMapsAPIGeocode
        else {
            return googleMapsApiGeocode(location, apiKey);
        }
    }
}
