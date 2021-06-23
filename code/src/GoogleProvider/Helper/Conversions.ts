// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace GoogleProvider.Helper.Conversions {
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
        location = location.replace(/[^a-zA-Z0-9 ]/g, '');
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
                        json.error_message ?? "Server response wasn't OK"
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
            console.error(
                'Invalid location. Using the default location -> 55 Thomson Pl 2nd floor, Boston, MA 02210, United States'
            );
            return new Promise((resolve) => {
                resolve(OSFramework.Helper.Constants.defaultMapCenter);
            });
        }

        // If the location doesn't have any chars a-z A-Z
        if (location.search(/[a-zA-Z]/g) === -1) {
            let latitude: number;
            let longitude: number;
            // If the location is a set of coordinates
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
