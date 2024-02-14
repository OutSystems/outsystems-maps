///<reference path="AbstractMapEvent.ts"/>

// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace OSFramework.Maps.Event.OSMap {
	/**
	 * Class that represents the MapProviderEvent event.
	 *
	 * @class MapProviderEvent
	 * @extends {AbstractEvent<OSFramework.Maps.OSMap.IMap>}
	 */
	export class MapProviderEvent extends AbstractMapEvent {
		/**
		 * Method that will trigger the event with the correct parameters.
		 * @param mapObj Map that is raising the event
		 * @param mapId Id of the Map that is raising the event
		 * @param eventName Name of the event that got raised
		 * @param coords Stringified object containing both Lat and Lng from the event (can be empty)
		 */
		public trigger(
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			mapObj: OSFramework.Maps.OSMap.IMap,
			mapId: string,
			eventName: string,
			coords: string,
			eventUniqueId: string
		): void {
			this.handlers.slice(0).forEach((h) => {
				// Checks if event block exists on page before calling its callback
				if (document.querySelector('.event-preview[name="' + h.uniqueId + '"]')) {
					Helper.CallbackAsyncInvocation(h.eventHandler, mapObj, mapId, eventName, coords, eventUniqueId);
				}
			});
		}
	}
}
