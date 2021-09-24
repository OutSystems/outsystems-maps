// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace MapAPI.MarkerManager.Events {
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
    const _pendingEvents: Map<
        string,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        { cb: any; event: OSFramework.Event.Marker.MarkerEventType }[]
    > = new Map<
        string,
        // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
        { cb: any; event: OSFramework.Event.Marker.MarkerEventType }[]
    >();

    const _eventsToMarkerId = new Map<string, string>(); //event.uniqueId -> marker.uniqueId

    /**
     * API method to check if there are pending events for a specific Marker
     *
     * @export
     * @param {string} map Map that is ready for events
     */
    export function CheckPendingEvents(
        marker: OSFramework.Marker.IMarker
    ): void {
        // For each key of the pendingEvents check if the map has the key as a widgetId or uniqueId and add the new handler
        for (const key of _pendingEvents.keys()) {
            if (marker.equalsToID(key)) {
                _pendingEvents.get(key).forEach((obj) => {
                    marker.markerEvents.addHandler(obj.event, obj.cb);
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
     */
    export function GetMarkerIdByEventUniqueId(
        eventUniqueId: string,
        lookUpDOM = true
    ): string {
        //Try to find in DOM only if not present on Map
        if (lookUpDOM && !_eventsToMarkerId.has(eventUniqueId)) {
            const eventElement = OSFramework.Helper.GetElementByUniqueId(
                eventUniqueId
            );
            const markerId = OSFramework.Helper.GetClosestMarkerId(
                eventElement
            );
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
     * @param {OSFramework.Event.Marker.MarkerEventType} eventName name of the event to get attached
     * @param {OSFramework.Callbacks.Marker.ClickEvent} callback to be invoked when the event occurs
     */
    export function Subscribe(
        markerId: string,
        eventName: OSFramework.Event.Marker.MarkerEventType,
        // eslint-disable-next-line
        callback: OSFramework.Callbacks.Marker.Event
    ): void {
        const marker = GetMarkerById(markerId);
        marker.markerEvents.addHandler(eventName, callback);
    }

    /**
     * API method to subscribe to events of a specific Marker by EventUniqueId
     *
     * @export
     * @param {string} eventUniqueId Id of the Event to be attached
     * @param {OSFramework.Event.Map.MapEventType} eventName name fo the event to be attached
     * @param {MapAPI.Callbacks.OSMap.Event} callback callback to be invoked when the event occurs
     */
    export function SubscribeByUniqueId(
        eventUniqueId: string,
        eventName: OSFramework.Event.Marker.MarkerEventType,
        // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
        callback: OSFramework.Callbacks.Marker.Event
    ): void {
        // Let's make sure that if the Map doesn't exist, we don't throw and exception but instead add the handler to the pendingEvents
        const markerId = GetMarkerIdByEventUniqueId(eventUniqueId);
        const marker = GetMarkerById(markerId, false);

        if (marker === undefined) {
            if (_pendingEvents.has(markerId)) {
                _pendingEvents.get(markerId).push({
                    event: eventName,
                    cb: callback
                });
            } else {
                _pendingEvents.set(markerId, [
                    {
                        event: eventName,
                        cb: callback
                    }
                ]);
            }
        } else {
            marker.markerEvents.addHandler(eventName, callback);
        }
    }

    /**
     * API method to subscribe to events on all the Markers from a specific Map - TO BE REMOVED
     *
     * @param {string} mapId Map where all the markers will get the event attached
     * @param {OSFramework.Event.Marker.MarkerEventType} eventName name of the event to get attached
     * @param {OSFramework.Callbacks.Marker.ClickEvent} callback to be invoked when the event occurs
     */
    export function SubscribeAll(
        mapId: string,
        eventName: OSFramework.Event.Marker.MarkerEventType,
        // eslint-disable-next-line
        callback: OSFramework.Callbacks.Marker.Event
    ): void {
        const map = MapManager.GetMapById(mapId);
        map.markers.forEach((marker) => {
            marker.markerEvents.addHandler(eventName, callback);
        });
    }

    /**
     * API method to unsubscribe an event from a specific Map
     *
     * @export
     * @param {string} eventUniqueId Map where the event will be removed
     * @param {OSFramework.Event.Map.MapEventType} eventName name of the event to be removed
     * @param {MapAPI.Callbacks.OSMap.Event} callback callback that will be removed
     */
    export function Unsubscribe(
        eventUniqueId: string,
        eventName: OSFramework.Event.Marker.MarkerEventType,
        // eslint-disable-next-line
        callback: OSFramework.Callbacks.Marker.Event
    ): void {
        const markerId = GetMarkerIdByEventUniqueId(eventUniqueId);
        const marker = GetMarkerById(markerId, false);
        if (marker !== undefined) {
            marker.markerEvents.removeHandler(eventName, callback);
            // Let's make sure the events get refreshed on the Marker provider
            marker.refreshProviderEvents();
        } else {
            if (_pendingEvents.has(eventUniqueId)) {
                const index = _pendingEvents
                    .get(eventUniqueId)
                    .findIndex((element) => {
                        return (
                            element.event === eventName &&
                            element.cb === callback
                        );
                    });
                if (index !== -1) {
                    _pendingEvents.get(eventUniqueId).splice(index, 1);
                }
            }
        }
    }
}
