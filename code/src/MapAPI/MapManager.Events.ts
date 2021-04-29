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

    /**
     * API method to subscribe to events of a specific Map
     *
     * @export
     * @param {string} mapId Map where the event will be attached
     * @param {OSFramework.Event.Grid.GridEventType} eventName name fo the event to be attached
     * @param {GridAPI.Callbacks.OSGrid.Event} callback callback to be invoked when the event occurs
     */
     export function Subscribe(
        mapId: string,
        eventName: OSFramework.Event.OSMap.MapEventType,
        // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
        callback: OSFramework.Callbacks.OSMap.Event
    ): void {
        const map = GetMapById(mapId);
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
     * API method to check if there are pending events to a specific Map
     *
     * @export
     * @param {string} mapId Map that is ready for events to be attached to
     */
     export function CheckPendingEvents(mapId: string): void {
        if (_pendingEvents.has(mapId)) {
            const map = GetMapById(mapId);
            _pendingEvents.get(mapId).forEach((obj) => {
                map.mapEvents.addHandler(obj.event, obj.cb);
            });
            _pendingEvents.delete(mapId);
        }
    }

    /**
     * API method to unsubscribe an event from a specific Map
     *
     * @export
     * @param {string} mapId Map where the event will be removed
     * @param {OSFramework.Event.Grid.GridEventType} eventName name of the event to be removed
     * @param {GridAPI.Callbacks.OSGrid.Event} callback callback that will be removed
     */
    export function Unsubscribe(
        mapId: string,
        eventName: OSFramework.Event.OSMap.MapEventType,
        // eslint-disable-next-line
        callback: OSFramework.Callbacks.OSMap.Event
    ): void {
        const map = GetMapById(mapId, false);
        if (map !== undefined) {
            map.mapEvents.removeHandler(eventName, callback);
        } else {
            if (_pendingEvents.has(mapId)) {
                const index = _pendingEvents
                    .get(mapId)
                    .findIndex((element) => {
                        return (
                            element.event === eventName &&
                            element.cb === callback
                        );
                    });
                if (index !== -1) {
                    _pendingEvents.get(mapId).splice(index, 1);
                }
            }
        }
    }
}