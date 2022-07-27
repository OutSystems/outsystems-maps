///<reference path="AbstractSearchPlacesEvent.ts"/>

// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace OSFramework.Event.SearchPlaces {
    /**
     * Class that represents the the Initialized event.
     *
     * @class SearchPlacesOnError
     * @extends {AbstractEvent<OSFramework.OSSearchPlaces.ISearchPlaces>}
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
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            searchPlacesObj: OSFramework.SearchPlaces.ISearchPlaces,
            searchPlacesId: string,
            eventName: string,
            errorMessage?: string
        ): void {
            this.handlers
                .slice(0)
                .forEach((h) =>
                    Helper.CallbackAsyncInvocation(
                        h,
                        searchPlacesObj,
                        searchPlacesId,
                        eventName,
                        errorMessage
                    )
                );
        }
    }
}
