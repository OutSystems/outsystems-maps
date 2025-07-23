///<reference path="AbstractSearchPlacesEvent.ts"/>

// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace OSFramework.Maps.Event.SearchPlaces {
	/**
	 * Class that represents the the Initialized event.
	 *
	 * @class SearchPlacesOnError
	 * @extends {AbstractEvent<OSFramework.Maps.OSSearchPlaces.ISearchPlaces>}
	 */
	export class SearchPlacesOnError extends AbstractSearchPlacesEvent {
		/**
		 * Method that will trigger the event with the correct parameters.
		 * @param searchPlacesObj SearchPlaces that is raising the event
		 * @param searchPlacesId Id of the SearchPlaces that is raising the event
		 * @param eventName Name of the event that got raised
		 * @param errorMessage Extra error messages that might come from errors that occurred using the Provider APIs
		 */
		public trigger(
			searchPlacesObj: OSFramework.Maps.SearchPlaces.ISearchPlaces,
			searchPlacesId: string,
			eventName: string,
			errorMessage?: string
		): void {
			this.handlers
				.slice(0)
				.forEach((h) =>
					Helper.CallbackAsyncInvocation(
						h.eventHandler,
						searchPlacesObj,
						searchPlacesId,
						eventName,
						errorMessage
					)
				);
		}
	}
}
