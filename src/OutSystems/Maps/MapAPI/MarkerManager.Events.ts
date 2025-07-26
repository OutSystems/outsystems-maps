// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace OutSystems.Maps.MapAPI.MarkerManager.Events {
	/**
	 * Map that will store the pending events for a specific Marker.
	 * These are events that are added to the Marker before it is ready.
	 */
	const _pendingEvents: Map<
		string,
		{
			cb: OSFramework.Maps.Callbacks.Generic;
			event: OSFramework.Maps.Event.Marker.MarkerEventType;
			uniqueId: string;
		}[]
	> = new Map<
		string,
		{
			cb: OSFramework.Maps.Callbacks.Generic;
			event: OSFramework.Maps.Event.Marker.MarkerEventType;
			uniqueId: string;
		}[]
	>();

	/**
	 * Map that will store the event uniqueId and the Marker uniqueId to which it belongs to.
	 */
	const _eventsToMarkerId = new Map<string, string>(); //event.uniqueId -> marker.uniqueId

	/**
	 * API method to check if there are pending events for a specific Marker
	 *
	 * @export
	 * @param {string} map Map that is ready for events
	 */
	export function CheckPendingEvents(marker: OSFramework.Maps.Marker.IMarker): void {
		// For each key of the pendingEvents check if the map has the key as a widgetId or uniqueId and add the new handler
		for (const key of _pendingEvents.keys()) {
			if (marker.equalsToID(key)) {
				_pendingEvents.get(key).forEach((obj) => {
					marker.markerEvents.addHandler(obj.event, obj.cb, obj.uniqueId);
				});
				// Make sure to delete the entry from the pendingEvents
				_pendingEvents.delete(key);
			}
		}
	}

	/**
	 * Returns the MarkerId based on the eventUniqueId
	 * @param eventUniqueId UniqueId of our Event
	 * @param lookUpDOM Search in DOM by the parent Marker
	 * @returns {string} The Marker uniqueId.
	 */
	export function GetMarkerIdByEventUniqueId(eventUniqueId: string, lookUpDOM = true): string {
		//Try to find in DOM only if not present on Map
		if (lookUpDOM && !_eventsToMarkerId.has(eventUniqueId)) {
			const eventElement = OSFramework.Maps.Helper.GetElementByUniqueId(eventUniqueId);
			const markerId = OSFramework.Maps.Helper.GetClosestMarkerId(eventElement);
			_eventsToMarkerId.set(eventUniqueId, markerId);
		}

		return _eventsToMarkerId.get(eventUniqueId);
	}

	/**
	 * API method to subscribe to events of a specific Marker
	 * This method is being deprecated. It will get removed soon.
	 *
	 * @export
	 * @param {string} markerId Marker where the events will get attached
	 * @param {OSFramework.Maps.Event.Marker.MarkerEventType} eventName name of the event to get attached
	 * @param {OSFramework.Maps.Callbacks.Marker.Event} callback to be invoked when the event occurs
	 * @returns {string} The response from the API.
	 */
	export function Subscribe(
		markerId: string,
		eventName: OSFramework.Maps.Event.Marker.MarkerEventType,
		callback: OSFramework.Maps.Callbacks.Marker.Event
	): string {
		const responseObj = {
			isSuccess: true,
			message: 'Success',
			code: '200',
		};
		try {
			const marker = GetMarkerById(markerId);
			marker.markerEvents.addHandler(eventName, callback, markerId);
			// Let's make sure the events get refreshed on the Marker provider
			marker.refreshProviderEvents();
		} catch (error) {
			responseObj.isSuccess = false;
			responseObj.message = error.message;
			responseObj.code = OSFramework.Maps.Enum.ErrorCodes.API_FailedSubscribeMarkerEvent;
		}

		return JSON.stringify(responseObj);
	}

	/**
	 * API method to subscribe to events of a specific Marker by EventUniqueId
	 *
	 * @export
	 * @param {string} eventUniqueId Id of the Event to be attached
	 * @param {OSFramework.Maps.Event.Map.MapEventType} eventName name fo the event to be attached
	 * @param {OSFramework.Maps.Callbacks.Marker.Event} callback callback to be invoked when the event occurs
	 * @returns {void}
	 */
	export function SubscribeByUniqueId(
		eventUniqueId: string,
		eventName: OSFramework.Maps.Event.Marker.MarkerEventType,
		callback: OSFramework.Maps.Callbacks.Marker.Event
	): void {
		// Let's make sure that if the Map doesn't exist, we don't throw and exception but instead add the handler to the pendingEvents
		const markerId = GetMarkerIdByEventUniqueId(eventUniqueId);
		const marker = GetMarkerById(markerId, false);

		if (marker === undefined) {
			if (_pendingEvents.has(markerId)) {
				_pendingEvents.get(markerId).push({
					event: eventName,
					cb: callback,
					uniqueId: eventUniqueId,
				});
			} else {
				_pendingEvents.set(markerId, [
					{
						event: eventName,
						cb: callback,
						uniqueId: eventUniqueId,
					},
				]);
			}
		} else {
			marker.markerEvents.addHandler(eventName, callback, eventUniqueId);
		}
	}

	/**
	 * API method to subscribe to events on all the Markers from a specific Map - TO BE REMOVED
	 *
	 * @param {string} mapId Map where all the markers will get the event attached
	 * @param {OSFramework.Maps.Event.Marker.MarkerEventType} eventName name of the event to get attached
	 * @param {OSFramework.Maps.Callbacks.Marker.ClickEvent} callback to be invoked when the event occurs
	 * @returns {void}
	 */
	export function SubscribeAll(
		mapId: string,
		eventName: OSFramework.Maps.Event.Marker.MarkerEventType,
		// eslint-disable-next-line
		callback: OSFramework.Maps.Callbacks.Marker.Event
	): void {
		const map = MapManager.GetMapById(mapId);
		map.markers.forEach((marker) => {
			marker.markerEvents.addHandler(eventName, callback, mapId);
		});
	}

	/**
	 * API method to unsubscribe an event from a specific Map
	 *
	 * @export
	 * @param {string} eventUniqueId Map where the event will be removed
	 * @param {OSFramework.Maps.Event.Map.MapEventType} eventName name of the event to be removed
	 * @param {OSFramework.Maps.Callbacks.Marker.Event} callback callback that will be removed
	 * @returns {void}
	 */
	export function Unsubscribe(
		eventUniqueId: string,
		eventName: OSFramework.Maps.Event.Marker.MarkerEventType,
		callback: OSFramework.Maps.Callbacks.Marker.Event
	): void {
		const markerId = GetMarkerIdByEventUniqueId(eventUniqueId);
		const marker = GetMarkerById(markerId, false);
		if (marker !== undefined) {
			marker.markerEvents.removeHandler(eventName, callback);
			// Let's make sure the events get refreshed on the Marker provider
			marker.refreshProviderEvents();
		} else {
			if (_pendingEvents.has(eventUniqueId)) {
				const index = _pendingEvents.get(eventUniqueId).findIndex((element) => {
					return element.event === eventName && element.cb === callback;
				});
				if (index !== -1) {
					_pendingEvents.get(eventUniqueId).splice(index, 1);
				}
			}
		}
	}

	/**
	 * API method to unsubscribe an event from a specific Marker
	 *
	 * @param {string} markerId Marker where the event will be removed
	 * @param {OSFramework.Maps.Event.Marker.MarkerEventType} eventName name of the event to be removed
	 * @param {OSFramework.Maps.Callbacks.Marker.Event} callback callback that will be removed
	 * @returns {string} The response from the API.
	 */
	export function UnsubscribeByMarkerId(
		markerId: string,
		eventName: OSFramework.Maps.Event.Marker.MarkerEventType,
		callback: OSFramework.Maps.Callbacks.Marker.Event
	): string {
		const responseObj = {
			isSuccess: true,
			message: 'Success',
			code: '200',
		};
		try {
			const marker = GetMarkerById(markerId);
			if (marker !== undefined) {
				marker.markerEvents.removeHandler(eventName, callback);
				// Let's make sure the events get refreshed on the Marker provider
				marker.refreshProviderEvents();
			}
		} catch (error) {
			responseObj.isSuccess = false;
			responseObj.message = error.message;
			responseObj.code = OSFramework.Maps.Enum.ErrorCodes.API_FailedUnsubscribeMarkerEvent;
		}

		return JSON.stringify(responseObj);
	}
}
