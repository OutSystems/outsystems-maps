// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace Provider.Leaflet.Helper.Conversions {
    /**
     * Make sure the location is a set of valid coordinates
     *
     * @param location Location to convert to coordinates
     */
    export function ValidateCoordinates(
        location: string
    ): Promise<OSFramework.Maps.OSStructures.OSMap.Coordinates> {
        return new Promise((resolve, reject) => {
            if (location === undefined || location.trim().length === 0) {
                console.warn(
                    'Invalid location. Using the default location -> { lat: 42.3517926, lng: -71.0467845 }'
                );
                resolve(OSFramework.Maps.Helper.Constants.defaultMapCenter);
            }

            // Regex that validates if string is a set of coordinates
            // Accepts "12.300,-8.220" and "12.300, -8.220"
            const regexValidator =
                /^-{0,1}\d*\.{0,1}\d*,( )?-{0,1}\d*\.{0,1}\d*$/;
            // If the provided location is a set of coordinates
            if (regexValidator.test(location)) {
                const coordinates =
                    new OSFramework.Maps.OSStructures.OSMap.Coordinates();
                // split the coordinates into latitude and longitude
                if (location.indexOf(',') > -1) {
                    coordinates.lat = parseFloat(
                        location.split(',')[0].replace(' ', '')
                    );
                    coordinates.lng = parseFloat(
                        location.split(',')[1].replace(' ', '')
                    );

                    resolve(coordinates);
                } else {
                    // If the location is not a set of valid coordinates throw an error
                    reject();
                }
            }
            // If the location is not a set of coordinates throw an error
            else {
                reject();
            }
        });
    }
}
