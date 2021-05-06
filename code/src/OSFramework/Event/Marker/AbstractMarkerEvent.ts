// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace OSFramework.Event.Marker {
    /**
     * Class that will make sure that the trigger invokes the handlers
     * with the correct parameters.
     *
     * @abstract
     * @class AbstractMarkerEvent
     * @extends {AbstractEvent<string>}
     */
    export abstract class AbstractMarkerEvent extends OSFramework.Event
        .AbstractEvent<string> {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        public trigger(
            mapId: string,
            markerId: string,
            ...args
        ): void {
            this.handlers.slice(0).forEach((h) => h(mapId, markerId, ...args));
        }
    }
}
