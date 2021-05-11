// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace MapAPI.MarkerManager.Events {
    /**
     * API method to subscribe to events of a specific Marker.
     *
     * @export
     * @param {string} markerId Marker in which to attach to an event.
     * @param {OSFramework.Event.Marker.MarkerEventType} eventName event to which attach to.
     * @param {OSFramework.Callbacks.Marker.ClickEvent} callback to be invoked qhen the event occurs.
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
}
