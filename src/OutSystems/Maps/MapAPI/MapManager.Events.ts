// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace OutSystems.Maps.MapAPI.MapManager.Events {
	/**
	 * Map that will store the pending events for a specific Map.
	 * These are events that are added to the Map before it is ready.
	 */
	const _pendingEvents: Map<
		string,
		{
			cb: OSFramework.Maps.Callbacks.Generic;
			event: OSFramework.Maps.Event.OSMap.MapEventType;
			uniqueId: string;
		}[]
	> = new Map<
		string,
		{
			cb: OSFramework.Maps.Callbacks.Generic;
			event: OSFramework.Maps.Event.OSMap.MapEventType;
			uniqueId: string;
		}[]
	>();

	/**
	 * Map that will store the event uniqueId and the Map uniqueId to which it belongs to.
	 */
	const _eventsToMapId = new Map<string, string>(); //event.uniqueId -> map.uniqueId

	/**
	 * API method to check if there are pending events for a specific Map
	 *
	 * @export
	 * @param {string} map Map that is ready for events
	 * @returns {void}
	 */
	export function CheckPendingEvents(map: OSFramework.Maps.OSMap.IMap): void {
		// For each key of the pendingEvents check if the map has the key as a widgetId or uniqueId and add the new handler
		for (const key of _pendingEvents.keys()) {
			if (map.equalsToID(key)) {
				_pendingEvents.get(key).forEach((obj) => {
					map.mapEvents.addHandler(obj.event, obj.cb, obj.uniqueId);
				});
				// Make sure to delete the entry from the pendingEvents
				_pendingEvents.delete(key);
			}
		}
	}

	/**
	 * Returns the MapId based on the eventUniqueId
	 * @param eventUniqueId UniqueId of our Event
	 * @param lookUpDOM Search in DOM by the parent Map
	 * @returns {string} The Map uniqueId.
	 */
	export function GetMapByEventUniqueId(eventUniqueId: string, lookUpDOM = true): string {
		//Try to find in DOM only if not present on Map
		if (lookUpDOM && !_eventsToMapId.has(eventUniqueId)) {
			const eventElement = OSFramework.Maps.Helper.GetElementByUniqueId(eventUniqueId);
			const mapId = OSFramework.Maps.Helper.GetClosestMapId(eventElement);
			const map = GetMapById(mapId);

			if (map) {
				_eventsToMapId.set(eventUniqueId, mapId);
			}
		}

		return _eventsToMapId.get(eventUniqueId);
	}

	/**
	 * API method to subscribe to events of a specific Map
	 * This method is being deprecated. It will get removed soon.
	 *
	 * @export
	 * @param {string} mapId Map where the event will be attached
	 * @param {OSFramework.Maps.Event.Map.MapEventType} eventName name fo the event to be attached
	 * @param {MapAPI.Callbacks.OSMap.Event} callback callback to be invoked when the event occurs
	 * @returns {void}
	 */
	export function Subscribe(
		mapId: string,
		eventName: OSFramework.Maps.Event.OSMap.MapEventType,
		callback: OSFramework.Maps.Callbacks.OSMap.Event
	): void {
		// Let's make sure that if the Map doesn't exist, we don't throw and exception but instead add the handler to the pendingEvents
		const map = GetMapById(mapId, false);
		if (map === undefined) {
			if (_pendingEvents.has(mapId)) {
				_pendingEvents.get(mapId).push({
					event: eventName,
					cb: callback,
					uniqueId: mapId,
				});
			} else {
				_pendingEvents.set(mapId, [
					{
						event: eventName,
						cb: callback,
						uniqueId: mapId,
					},
				]);
			}
		} else {
			map.mapEvents.addHandler(eventName, callback);
		}
	}

	/**
	 * API method to subscribe to events of a specific Map by EventUniqueId
	 *
	 * @export
	 * @param {string} uniqueId Id of the Event to be attached
	 * @param {OSFramework.Maps.Event.Map.MapEventType} eventName name fo the event to be attached
	 * @param {MapAPI.Callbacks.OSMap.Event} callback callback to be invoked when the event occurs
	 * @returns {void}
	 */
	export function SubscribeByUniqueId(
		eventUniqueId: string,
		eventName: OSFramework.Maps.Event.OSMap.MapEventType,
		callback: OSFramework.Maps.Callbacks.OSMap.Event
	): void {
		// Let's make sure that if the Map doesn't exist, we don't throw and exception but instead add the handler to the pendingEvents
		const mapId = GetMapByEventUniqueId(eventUniqueId);
		const map = GetMapById(mapId, false);

		if (map === undefined) {
			if (_pendingEvents.has(mapId)) {
				_pendingEvents.get(mapId).push({
					event: eventName,
					cb: callback,
					uniqueId: eventUniqueId,
				});
			} else {
				_pendingEvents.set(mapId, [
					{
						event: eventName,
						cb: callback,
						uniqueId: eventUniqueId,
					},
				]);
			}
		} else {
			map.mapEvents.addHandler(eventName, callback, eventUniqueId);
			map.refreshProviderEvents();
		}
	}

	/**
	 * API method to unsubscribe an event from a specific Map
	 *
	 * @export
	 * @param {string} eventUniqueId Event Id that will get removed
	 * @param {OSFramework.Maps.Event.Map.MapEventType} eventName name of the event to be removed
	 * @param {MapAPI.Callbacks.OSMap.Event} callback callback that will be removed
	 * @returns {void}
	 */
	export function Unsubscribe(
		eventUniqueId: string,
		eventName: OSFramework.Maps.Event.OSMap.MapEventType,
		callback: OSFramework.Maps.Callbacks.OSMap.Event
	): void {
		const mapId = GetMapByEventUniqueId(eventUniqueId);
		const map = GetMapById(mapId, false);

		if (map !== undefined) {
			map.mapEvents.removeHandler(eventName, callback);
			// Let's make sure the events get refreshed on the Map provider
			map.refreshProviderEvents();
		} else {
			if (_pendingEvents.has(mapId)) {
				const index = _pendingEvents.get(mapId).findIndex((element) => {
					return element.event === eventName && element.cb === callback;
				});
				if (index !== -1) {
					_pendingEvents.get(mapId).splice(index, 1);
				}
			}
		}
	}
}
