// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace OSFramework.Event.Marker {
    /**
     * Class that will make sure that the trigger invokes the handlers
     * with the correct parameters.
     *
     * @abstract
     * @class AbstractMarkerEvent
     * @extends {AbstractEvent<OSFramework.Marker.IMarker>}
     */
    export abstract class AbstractMarkerEvent extends OSFramework.Event
        .AbstractEvent<OSFramework.Marker.IMarker> {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        public trigger(
            markerObj: OSFramework.Marker.IMarker,
            markerId: string,
            mapId: string,
            ...args
        ): void {
            this.handlers.slice(0).forEach((h) => h(markerId, markerObj, mapId));
        }
    }
}
