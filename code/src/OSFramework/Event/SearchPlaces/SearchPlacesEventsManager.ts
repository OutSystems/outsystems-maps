// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace OSFramework.Event.SearchPlaces {
    /**
     * Class that will be responsible for managing the events of the SearchPlaces.
     *
     * @export
     * @class SearchPlacesEventsManager
     * @extends {AbstractEventsManager<SearchPlacesEventType, OSFramework.SearchPlaces.ISearchPlaces>}
     */
    export class SearchPlacesEventsManager extends AbstractEventsManager<
        SearchPlacesEventType,
        OSFramework.SearchPlaces.ISearchPlaces
    > {
        private _searchPlaces: OSFramework.SearchPlaces.ISearchPlaces;

        constructor(searchPlaces: OSFramework.SearchPlaces.ISearchPlaces) {
            super();
            this._searchPlaces = searchPlaces;
        }

        protected getInstanceOfEventType(
            eventType: SearchPlacesEventType
        ): OSFramework.Event.IEvent<OSFramework.SearchPlaces.ISearchPlaces> {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            let event: OSFramework.Event.IEvent<OSFramework.SearchPlaces.ISearchPlaces>;

            switch (eventType) {
                case SearchPlacesEventType.Initialized:
                    event = new SearchPlacesInitializedEvent();
                    break;
                case SearchPlacesEventType.OnError:
                    event = new SearchPlacesOnError();
                    break;
                case SearchPlacesEventType.OnPlaceSelect:
                    event = new SearchPlacesOnPlaceSelect();
                    break;
                default:
                    this._searchPlaces.searchPlacesEvents.trigger(
                        SearchPlaces.SearchPlacesEventType.OnError,
                        this._searchPlaces,
                        Enum.ErrorCodes.GEN_UnsupportedEventSearchPlaces,
                        `${eventType}`
                    );
                    return;
            }
            return event;
        }

        public addHandler(
            eventType: SearchPlacesEventType,
            handler: Callbacks.SearchPlaces.Event,
            eventUniqueId: string
        ): void {
            //if the SearchPlaces is already ready, fire immediatly the event.
            if (
                eventType === SearchPlacesEventType.Initialized &&
                this._searchPlaces.isReady
            ) {
                //make the invocation of the handler assync.
                Helper.AsyncInvocation(
                    handler,
                    this._searchPlaces,
                    this._searchPlaces.widgetId
                );
            } else {
                super.addHandler(eventType, handler, eventUniqueId);
            }
        }

        /**
         * Trigger the specific events depending on the event type specified
         * @param eventType Type of the event currently supported in the SearchPlaces element.
         * @param value Value to be passed to OS in the type of a string.
         */
        public trigger(
            eventType: SearchPlacesEventType,
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            searchPlaces?: OSFramework.SearchPlaces.ISearchPlaces,
            eventInfo?: string,
            // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
            ...args: any
        ): void {
            // Check if the FileLayer has any events associated
            if (this.handlers.has(eventType)) {
                const handlerEvent = this.handlers.get(eventType);

                switch (eventType) {
                    case SearchPlacesEventType.Initialized:
                        handlerEvent.trigger(
                            this._searchPlaces, // SearchPlaces Object that was initialized
                            this._searchPlaces.widgetId ||
                                this._searchPlaces.uniqueId // Id of SearchPlaces block that was initialized
                        );
                        break;
                    case SearchPlacesEventType.OnError:
                        handlerEvent.trigger(
                            this._searchPlaces, // SearchPlaces Object that had the error
                            this._searchPlaces.widgetId ||
                                this._searchPlaces.uniqueId, // Id of SearchPlaces block that had the error
                            eventInfo, // Error Code
                            args[0] // Extra Error messages that might come from the Provider APIs (geocoding for instance)
                        );
                        break;
                    case SearchPlacesEventType.OnPlaceSelect:
                        handlerEvent.trigger(
                            this._searchPlaces, // SearchPlaces Object where the place selection occurred.
                            this._searchPlaces.widgetId ||
                                this._searchPlaces.uniqueId, // Id of SearchPlaces block that was clicked
                            args[0].name, // name of the place selected
                            args[0].coordinates, // coordinates of the place selected
                            args[0].address // full address of the place selected
                        );
                        break;
                    // If the event is not valid we can fall in the default case of the switch and throw an error
                    default:
                        this._searchPlaces.searchPlacesEvents.trigger(
                            SearchPlaces.SearchPlacesEventType.OnError,
                            this._searchPlaces,
                            Enum.ErrorCodes.GEN_UnsupportedEventSearchPlaces,
                            `${eventType}`
                        );
                        return;
                }
            }
        }
    }
}
