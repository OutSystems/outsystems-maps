// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace GoogleProvider.Helper.Conversions {
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
        // If the location is a set of coordinates
        if (location.search(/[a-zA-Z]/g) === -1) {
            let latitude: number;
            let longitude: number;
            if (location.indexOf(',') > -1) {
                latitude = parseFloat(location.split(',')[0].replace(' ', ''));
                longitude = parseFloat(location.split(',')[1].replace(' ', ''));

                return new Promise((resolve) => {
                    resolve({ lat: latitude, lng: longitude });
                });
            }
        }
        // If the location is an address
        else {
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
                        throw new Error("Server response wasn't OK");
                    }
                    const loc = json.results[0].geometry.location;
                    return { lat: loc.lat, lng: loc.lng };
                });
        }
    }
}
