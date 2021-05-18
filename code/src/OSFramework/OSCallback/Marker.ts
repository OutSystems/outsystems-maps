/**
 * Namespace that contains the callbacks signatures to be passed in Marker events.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace OSFramework.Callbacks.Marker {
    /**
     * This is the callback signature for events triggered by Markers.
     * @param {string} mapId id of the Map where the Marker that triggered the event belongs to
     * @param {string} markerId id of the Marker that triggered the event
     * @param {OSFramework.Marker.Marker} markerObj object of the Marker that triggered the event
     */
    export type Event = {
        (
            mapId: string,
            markerId: string,
            markerObj: OSFramework.Marker.IMarker,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ...args: any
        ): void;
    };
}
