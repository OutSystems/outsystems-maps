// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace MapAPI.MarkerManager.Events {
    /**
     * API method to subscribe to events of a specific Marker
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
     * API method to subscribe to events on all the Markers from a specific Map
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
}
