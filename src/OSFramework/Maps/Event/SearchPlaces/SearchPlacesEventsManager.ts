// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace OSFramework.Maps.Event.SearchPlaces {
	/**
	 * Class that will be responsible for managing the events of the SearchPlaces.
	 *
	 * @export
	 * @class SearchPlacesEventsManager
	 * @extends {AbstractEventsManager<SearchPlacesEventType, OSFramework.Maps.SearchPlaces.ISearchPlaces>}
	 */
	export class SearchPlacesEventsManager extends AbstractEventsManager<
		SearchPlacesEventType,
		OSFramework.Maps.SearchPlaces.ISearchPlaces
	> {
		private _searchPlaces: OSFramework.Maps.SearchPlaces.ISearchPlaces;

		constructor(searchPlaces: OSFramework.Maps.SearchPlaces.ISearchPlaces) {
			super();
			this._searchPlaces = searchPlaces;
		}

		protected getInstanceOfEventType(
			eventType: SearchPlacesEventType
		): OSFramework.Maps.Event.IEvent<OSFramework.Maps.SearchPlaces.ISearchPlaces> {
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			let event: OSFramework.Maps.Event.IEvent<OSFramework.Maps.SearchPlaces.ISearchPlaces>;

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
						undefined,
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
			if (eventType === SearchPlacesEventType.Initialized && this._searchPlaces.isReady) {
				//make the invocation of the handler assync.
				Helper.CallbackAsyncInvocation(handler, this._searchPlaces, this._searchPlaces.widgetId);
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
			searchPlaces?: Maps.SearchPlaces.ISearchPlaces,
			eventInfo?: string,
			searchPlacesEventParams?: Maps.SearchPlaces.ISearchPlacesEventParams,
			...args: unknown[]
		): void {
			// Check if the FileLayer has any events associated
			if (this.handlers.has(eventType)) {
				const handlerEvent = this.handlers.get(eventType);

				switch (eventType) {
					case SearchPlacesEventType.Initialized:
						handlerEvent.trigger(
							searchPlaces, // SearchPlaces Object that was initialized
							searchPlaces.widgetId || searchPlaces.uniqueId // Id of SearchPlaces block that was initialized
						);
						break;
					case SearchPlacesEventType.OnError:
						handlerEvent.trigger(
							searchPlaces, // SearchPlaces Object that had the error
							searchPlaces.widgetId || searchPlaces.uniqueId, // Id of SearchPlaces block that had the error
							eventInfo, // Error Code
							...args // Extra Error messages that might come from the Provider APIs (geocoding for instance)
						);
						break;
					case SearchPlacesEventType.OnPlaceSelect:
						handlerEvent.trigger(
							searchPlaces, // SearchPlaces Object where the place selection occurred.
							searchPlaces.widgetId || searchPlaces.uniqueId, // Id of SearchPlaces block that was clicked
							searchPlacesEventParams.name, // name of the place selected
							searchPlacesEventParams.coordinates, // coordinates of the place selected
							searchPlacesEventParams.address // full address of the place selected
						);
						break;
					// If the event is not valid we can fall in the default case of the switch and throw an error
					default:
						this._searchPlaces.searchPlacesEvents.trigger(
							SearchPlaces.SearchPlacesEventType.OnError,
							searchPlaces,
							Enum.ErrorCodes.GEN_UnsupportedEventSearchPlaces,
							undefined,
							`${eventType}`
						);
						return;
				}
			}
		}
	}
}
