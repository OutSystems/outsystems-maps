/**
 * This namespace joins methods that can be used by Maps and Places
 */

// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace GoogleProvider.SharedComponents {
    export function InitializeScripts(
        // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
        object: any,
        cb: () => void
    ): void {
        let script = document.getElementById(
            'google-maps-script'
        ) as HTMLScriptElement;
        if (typeof google === 'object' && typeof google.maps === 'object') {
            cb.bind(object)();
        } else {
            if (script === null) {
                script = document.createElement('script');
                /* eslint-disable-next-line prettier/prettier */
                    script.src =
                    OSFramework.Helper.Constants.googleMapsApiMap +
                    '?key=' +
                    object.config.apiKey +
                    // In order to use the drawingTools we need to add it into the libraries via the URL = drawing
                    // In order to use the heatmap we need to add it into the libraries via the URL = visualization
                    // In order to use the searchplaces we need to add it into the libraries via the URL = places (in case the Map is the first to import the scripts)
                    '&libraries=drawing,visualization,places';
                script.async = true;
                script.defer = true;
                script.id = 'google-maps-script';
                document.head.appendChild(script);
            }
            object._scriptCallback = cb.bind(object);
            script.addEventListener('load', object._scriptCallback);
        }
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
    export function RemoveEventsFromProvider(object: any): void {
        if (object._listeners === undefined) object._listeners = [];
        // Make sure all the listeners get removed before adding the new ones
        object._listeners.forEach((eventListener, index) => {
            // Google maps api way of clearing listeners from the map provider
            google.maps.event.clearListeners(object.provider, eventListener);
            object._listeners.splice(index, 1);
        });
    }

    /** This method will help converting the bounds (string) into the respective coordinates that will be used on the bounds
     * It returns a promise because bounds will get converted into coordinates
     * The method resposible for this conversion (Helper.Conversions.ConvertToCoordinates) also returns a Promise
     * This Promise will only get resolved after the provider gets built (asynchronously)
     */
    export function ConvertStringToBounds(
        bounds: OSFramework.OSStructures.OSMap.BoundsString,
        apiKey: string,
        errorCb: () => void
    ): Promise<OSFramework.OSStructures.OSMap.Bounds> {
        // If the SearchArea have empty bounds, throw an error
        // make sure the provided bounds (string) have the correct format
        if (OSFramework.Helper.HasAnyEmptyBound(bounds)) {
            errorCb();
            return;
        }

        const cardinalDirections = ['north', 'south', 'east', 'west'];
        return new Promise((resolve, reject) => {
            let boundsLength = 0;
            const newBounds = new OSFramework.OSStructures.OSMap.Bounds();
            cardinalDirections.forEach((cd) => {
                // Regex that validates if string is a coordinate (latitude or longitude)
                const regexValidator = /^-{0,1}\d*\.{0,1}\d*$/;
                if (regexValidator.test(bounds[cd])) {
                    boundsLength++;
                    newBounds[cd] = parseFloat(bounds[cd]);
                    if (boundsLength === 4) {
                        resolve(newBounds);
                    }
                } else {
                    Helper.Conversions.ConvertToCoordinates(bounds[cd], apiKey)
                        .then((response) => {
                            boundsLength++;
                            switch (cd) {
                                case 'north':
                                case 'south':
                                    newBounds[cd] = response.lat;
                                    break;
                                case 'east':
                                case 'west':
                                default:
                                    newBounds[cd] = response.lng;
                                    break;
                            }
                            if (boundsLength === 4) {
                                resolve(newBounds);
                            }
                        })
                        .catch((e) => reject(e));
                }
            });
        });
    }
}
