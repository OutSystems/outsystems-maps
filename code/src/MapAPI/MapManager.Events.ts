// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace MapAPI.MapManager.Events {
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
    const _pendingEvents: Map<
        string,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        { cb: any; event: OSFramework.Event.OSMap.MapEventType }[]
    > = new Map<
        string,
        // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
        { cb: any; event: OSFramework.Event.OSMap.MapEventType }[]
    >();

    const _eventsToMapId = new Map<string, string>(); //event.uniqueId -> map.uniqueId

    /**
     * API method to check if there are pending events for a specific Map
     *
     * @export
     * @param {string} map Map that is ready for events
     */
    export function CheckPendingEvents(map: OSFramework.OSMap.IMap): void {
        // For each key of the pendingEvents check if the map has the key as a widgetId or uniqueId and add the new handler
        for (const key of _pendingEvents.keys()) {
            if (map.equalsToID(key)) {
                _pendingEvents.get(key).forEach((obj) => {
                    map.mapEvents.addHandler(obj.event, obj.cb);
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
     */
    export function GetMapByEventUniqueId(
        eventUniqueId: string,
        lookUpDOM = true
    ): string {
        //Try to find in DOM only if not present on Map
        if (lookUpDOM && !_eventsToMapId.has(eventUniqueId)) {
            const eventElement = OSFramework.Helper.GetElementByUniqueId(
                eventUniqueId
            );
            const map = OSFramework.Helper.GetClosestMap(eventElement);

            if (map) {
                _eventsToMapId.set(eventUniqueId, map.uniqueId);
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
     * @param {OSFramework.Event.Map.MapEventType} eventName name fo the event to be attached
     * @param {MapAPI.Callbacks.OSMap.Event} callback callback to be invoked when the event occurs
     */
    export function Subscribe(
        mapId: string,
        eventName: OSFramework.Event.OSMap.MapEventType,
        // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
        callback: OSFramework.Callbacks.OSMap.Event
    ): void {
        // Let's make sure that if the Map doesn't exist, we don't throw and exception but instead add the handler to the pendingEvents
        const map = GetMapById(mapId, false);
        if (map === undefined) {
            if (_pendingEvents.has(mapId)) {
                _pendingEvents.get(mapId).push({
                    event: eventName,
                    cb: callback
                });
            } else {
                _pendingEvents.set(mapId, [
                    {
                        event: eventName,
                        cb: callback
                    }
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
     * @param {OSFramework.Event.Map.MapEventType} eventName name fo the event to be attached
     * @param {MapAPI.Callbacks.OSMap.Event} callback callback to be invoked when the event occurs
     */
    export function SubscribeByUniqueId(
        uniqueId: string,
        eventName: OSFramework.Event.OSMap.MapEventType,
        // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
        callback: OSFramework.Callbacks.OSMap.Event
    ): void {
        // Let's make sure that if the Map doesn't exist, we don't throw and exception but instead add the handler to the pendingEvents
        const mapId = GetMapByEventUniqueId(uniqueId);
        const map = GetMapById(mapId, false);

        if (map === undefined) {
            if (_pendingEvents.has(mapId)) {
                _pendingEvents.get(mapId).push({
                    event: eventName,
                    cb: callback
                });
            } else {
                _pendingEvents.set(mapId, [
                    {
                        event: eventName,
                        cb: callback
                    }
                ]);
            }
        } else {
            map.mapEvents.addHandler(eventName, callback);
            map.refreshProviderEvents();
        }
    }

    /**
     * API method to unsubscribe an event from a specific Map
     *
     * @export
     * @param {string} eventUniqueId Event Id that will get removed
     * @param {OSFramework.Event.Map.MapEventType} eventName name of the event to be removed
     * @param {MapAPI.Callbacks.OSMap.Event} callback callback that will be removed
     */
    export function Unsubscribe(
        eventUniqueId: string,
        eventName: OSFramework.Event.OSMap.MapEventType,
        // eslint-disable-next-line
        callback: OSFramework.Callbacks.OSMap.Event
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
                    return (
                        element.event === eventName && element.cb === callback
                    );
                });
                if (index !== -1) {
                    _pendingEvents.get(mapId).splice(index, 1);
                }
            }
        }
    }
}
