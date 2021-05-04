namespace GoogleProvider.Helper.Conversions {

    /**
     * Promise that will retrive the coordinates of a specific address via Google Maps API
     * 
     * @param address Address of a location to convert to coordinates
     * @param apiKey Google API Key 
     * @returns Promise that will retrieve the coordinates
     */
    export function ConvertAddressToCoordinates(
        address: string,
        apiKey: string
    ): any {
        if (address.search(/[a-zA-Z]/g) === -1) {
            let latitude: number;
            let longitude: number;
            if (address.indexOf(',') > -1) {
                latitude = parseFloat(address.split(',')[0].replace(' ', ''));
                longitude = parseFloat(address.split(',')[1].replace(' ', ''));

                return new Promise((resolve, reject) => {
                    resolve({lat: latitude, lng: longitude});
                });
                
            }
        } else {
            address = address.replace(/[^a-zA-Z0-9 ]/g, "");
            return fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=${apiKey}`)
            .then(response => {
                if(response.ok) {
                    return response.json();
                } else {
                    throw new Error('Server response wasn\'t OK');
                }
            })
            .then(json => {
                const location = json.results[0].geometry.location;
                return {lat: location.lat, lng: location.lng};
            });
        }    
    }
}