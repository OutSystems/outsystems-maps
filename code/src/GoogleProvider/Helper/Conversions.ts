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
        if(location.length === 0) {
            throw new Error("Invalid location.");
        }
        // If the location is a set of coordinates
        if (location.search(/[a-zA-Z]/g) === -1) {
            let latitude: number;
            let longitude: number;
            if (location.indexOf(',') > -1) {
                latitude = parseFloat(location.split(',')[0].replace(' ', ''));
                longitude = parseFloat(location.split(',')[1].replace(' ', ''));

                return new Promise((resolve, reject) => {
                    resolve({lat: latitude, lng: longitude});
                });
                
            }
        } 
        // If the location is an address
        else {
            location = location.replace(/[^a-zA-Z0-9 ]/g, "");
            return fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${location}&key=${apiKey}`)
            .then(response => {
                if(response.ok) {
                    return response.json();
                } else {
                    throw new Error('Server response wasn\'t OK');
                }
            })
            .then(json => {
                if(json.results.length === 0){
                    throw new Error('Server response wasn\'t OK');
                }
                const loc = json.results[0].geometry.location;
                return {lat: loc.lat, lng: loc.lng};
            });
        }    
    }
}