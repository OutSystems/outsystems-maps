// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace OutSystems.Maps.MapAPI.ShapeManager.Events {
	/**
	 * Map that will store the pending events for a specific Shape.
	 * These are events that are added to the Shape before it is ready.
	 */
	const _pendingEvents: Map<
		string,
		{
			cb: OSFramework.Maps.Callbacks.Generic;
			event: OSFramework.Maps.Event.Shape.ShapeEventType;
			uniqueId: string;
		}[]
	> = new Map<
		string,
		{
			cb: OSFramework.Maps.Callbacks.Generic;
			event: OSFramework.Maps.Event.Shape.ShapeEventType;
			uniqueId: string;
		}[]
	>();

	/**
	 * Map that will store the event uniqueId and the Shape uniqueId to which it belongs to.
	 */
	const _eventsToShapeId = new Map<string, string>(); //event.uniqueId -> shape.uniqueId

	/**
	 * API method to check if there are pending events for a specific Shape
	 *
	 * @export
	 * @param {string} shape Shape that is ready for events
	 */
	export function CheckPendingEvents(shape: OSFramework.Maps.Shape.IShape): void {
		// For each key of the pendingEvents check if the shape has the key as a widgetId or uniqueId and add the new handler
		for (const key of _pendingEvents.keys()) {
			if (shape.equalsToID(key)) {
				_pendingEvents.get(key).forEach((obj) => {
					shape.shapeEvents.addHandler(obj.event, obj.cb, obj.uniqueId);
				});
				// Make sure to delete the entry from the pendingEvents
				_pendingEvents.delete(key);
			}
		}
	}

	/**
	 * Returns the shapeId based on the eventUniqueId
	 * @param eventUniqueId UniqueId of our Event
	 * @param lookUpDOM Search in DOM by the parent Shape
	 * @returns {string} The Shape uniqueId.
	 */
	export function GetShapeIdByEventUniqueId(eventUniqueId: string, lookUpDOM = true): string {
		//Try to find in DOM only if not present on Shape
		if (lookUpDOM && !_eventsToShapeId.has(eventUniqueId)) {
			const eventElement = OSFramework.Maps.Helper.GetElementByUniqueId(eventUniqueId);
			const shapeId = OSFramework.Maps.Helper.GetClosestShapeId(eventElement);
			_eventsToShapeId.set(eventUniqueId, shapeId);
		}

		return _eventsToShapeId.get(eventUniqueId);
	}

	/**
	 * API method to subscribe to events of a specific Shape by EventUniqueId
	 *
	 * @export
	 * @param {string} eventUniqueId Id of the Event to be attached
	 * @param {OSFramework.Maps.Event.Shape.ShapeEventType} eventName name fo the event to be attached
	 * @param {MapAPI.Callbacks.Shape.Event} callback callback to be invoked when the event occurs
	 * @returns {void}
	 */
	export function Subscribe(
		shapeId: string,
		eventName: OSFramework.Maps.Event.Shape.ShapeEventType,
		// eslint-disable-next-line
		callback: OSFramework.Maps.Callbacks.Shape.Event
	): void {
		const shape = GetShapeById(shapeId);
		shape.shapeEvents.addHandler(eventName, callback, shapeId);
	}

	/**
	 * API method to subscribe to events of a specific Marker by EventUniqueId
	 *
	 * @export
	 * @param {string} eventUniqueId Id of the Event to be attached
	 * @param {OSFramework.Maps.Event.Map.MapEventType} eventName name fo the event to be attached
	 * @param {MapAPI.Callbacks.OSMap.Event} callback callback to be invoked when the event occurs
	 * @returns {void}
	 */
	export function SubscribeByEventUniqueId(
		eventUniqueId: string,
		eventName: OSFramework.Maps.Event.Shape.ShapeEventType,
		callback: OSFramework.Maps.Callbacks.Shape.Event
	): void {
		// Let's make sure that if the Map doesn't exist, we don't throw and exception but instead add the handler to the pendingEvents
		const shapeId = GetShapeIdByEventUniqueId(eventUniqueId);
		const shape = GetShapeById(shapeId, false);

		if (shape === undefined) {
			if (_pendingEvents.has(shapeId)) {
				_pendingEvents.get(shapeId).push({
					event: eventName,
					cb: callback,
					uniqueId: eventUniqueId,
				});
			} else {
				_pendingEvents.set(shapeId, [
					{
						event: eventName,
						cb: callback,
						uniqueId: eventUniqueId,
					},
				]);
			}
		} else {
			shape.shapeEvents.addHandler(eventName, callback, eventUniqueId);
			shape.refreshProviderEvents();
		}
	}

	/**
	 * API method to unsubscribe an event from a specific Shape
	 *
	 * @export
	 * @param {string} eventUniqueId Shape where the event will be removed
	 * @param {OSFramework.Maps.Event.Shape.ShapeEventType} eventName name of the event to be removed
	 * @param {MapAPI.Callbacks.Shape.Event} callback callback that will be removed
	 * @returns {void}
	 */
	export function Unsubscribe(
		eventUniqueId: string,
		eventName: OSFramework.Maps.Event.Shape.ShapeEventType,
		// eslint-disable-next-line
		callback: OSFramework.Maps.Callbacks.Shape.Event
	): void {
		const shapeId = GetShapeIdByEventUniqueId(eventUniqueId);
		const shape = GetShapeById(shapeId);
		if (shape !== undefined) {
			shape.shapeEvents.removeHandler(eventName, callback);
			// Let's make sure the events get refreshed on the shape provider
			shape.refreshProviderEvents();
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
}