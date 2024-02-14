/**
 * This namespace joins methods that can be used by Maps and Places
 */

// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace Provider.Maps.Google.SharedComponents {
	let googleMapsLoadPromise = undefined;
	export function InitializeScripts(apiKey: string, cb: () => void): void {
		if (typeof google === 'object' && typeof google.maps === 'object') {
			cb();
		} else {
			/**
			 * The first map to load in the application will create the promise,
			 * so that itself and every subsequent map added to the page (before
			 * the script is loaded), will wait for the promise to be resolved
			 * (Google Maps loaded).
			 */
			if (googleMapsLoadPromise === undefined) {
				googleMapsLoadPromise = new Promise((resolve) => {
					window.GMCB = () => {
						//this method is just to avoid unnecessary warning on the console;
						window.GMCB = undefined;
						resolve(0);
						googleMapsLoadPromise = undefined;
					};
					const script = document.createElement('script');
					script.src =
						`${OSFramework.Maps.Helper.Constants.googleMapsApiMap}?` +
						`key=${apiKey}` +
						`&libraries=${OSFramework.Maps.Helper.Constants.gmlibraries}` +
						`&v=${OSFramework.Maps.Helper.Constants.gmversion}` +
						`&loading=async` +
						`&callback=GMCB`;
					script.async = true;
					script.defer = true;
					script.id = OSFramework.Maps.Helper.Constants.googleMapsScript;
					document.head.appendChild(script);
				});
			}

			// We have to use this promise instead of the callback of the library because
			// the callback will only work of 1st map on the page
			googleMapsLoadPromise.then(cb);
		}
	}

	/**
	 * Remove...
	 * @param object
	 */
	export function RemoveEventsFromProvider(
		object: OSMap.IMapGoogle | OSFramework.Maps.SearchPlaces.ISearchPlaces
	): void {
		// Make sure all the listeners get removed before adding the new ones
		object.addedEvents.forEach((eventListener, index) => {
			// Google maps api way of clearing listeners from the map provider
			google.maps.event.clearListeners(object.provider, eventListener);
			object.addedEvents.splice(index, 1);
		});
	}

	/**
	 * This method will help converting the bounds (string) into the respective coordinates that will be used on the bounds
	 * It returns a promise because bounds will get converted into coordinates
	 * The method resposible for this conversion (Helper.Conversions.ConvertToCoordinates) also returns a Promise
	 * This Promise will only get resolved after the provider gets built (asynchronously)
	 *
	 * @export
	 * @param {OSFramework.Maps.OSStructures.OSMap.BoundsString} bounds
	 * @param {string} apiKey
	 * @param {() => void} errorCb
	 * @return {*}  {Promise<OSFramework.Maps.OSStructures.OSMap.Bounds>}
	 */
	export function ConvertStringToBounds(
		bounds: OSFramework.Maps.OSStructures.OSMap.BoundsString,
		apiKey: string,
		errorCb: () => void
	): Promise<OSFramework.Maps.OSStructures.OSMap.Bounds> {
		// If the SearchArea have empty bounds, throw an error
		// make sure the provided bounds (string) have the correct format
		if (OSFramework.Maps.Helper.HasAnyEmptyBound(bounds)) {
			errorCb();
			return;
		}

		const cardinalDirections = ['north', 'south', 'east', 'west'];
		return new Promise((resolve, reject) => {
			let boundsLength = 0;
			const finalBounds = new OSFramework.Maps.OSStructures.OSMap.Bounds();
			// forEach ['north', 'south', 'east', 'west'] cardinal direction
			cardinalDirections.forEach((cd) => {
				// Use Regex to validate if string is a single coordinate (latitude or longitude)
				// If the string is a coordinate, we just need to set the value to the finalBounds object
				// Else, convert the string to coordinates and then set its value on the respective object property
				const regexValidator = /^-{0,1}\d*\.{0,1}\d*$/;
				if (regexValidator.test(bounds[cd])) {
					// Make sure to increment the boundsLength to validate whether the bounds structure has all the cardinal directions or not.
					boundsLength++;
					finalBounds[cd] = parseFloat(bounds[cd]);
					// Because this is a cycle we need to ensure if we already have all the cardinal directions to resolve the promise
					// If boundsLength === 4, the bounds structure has all the cardinal directions (north, south, east and west)
					// And the promise is ready -> resolve()
					if (boundsLength === 4) {
						resolve(finalBounds);
					}
				} else {
					Helper.Conversions.ConvertToCoordinates(bounds[cd])
						.then((response) => {
							// Make sure to increment the boundsLength to validate whether the bounds structure has all the cardinal directions or not.
							boundsLength++;
							switch (cd) {
								case 'north':
								case 'south':
									// If the currenct cardinalDirection is north or south, just use the latitude from the response
									finalBounds[cd] = response.lat;
									break;
								case 'east':
								case 'west':
								default:
									// If the currenct cardinalDirection is east or west use the longitude from the response
									finalBounds[cd] = response.lng;
									break;
							}
							// Because this is a cycle we need to ensure if we already have all the cardinal directions to resolve the promise
							// If boundsLength === 4, the bounds structure has all the cardinal directions (north, south, east and west)
							// And the promise is ready -> resolve()
							if (boundsLength === 4) {
								resolve(finalBounds);
							}
						})
						.catch((e) => reject(e));
				}
			});
		});
	}
}
