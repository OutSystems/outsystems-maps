// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace OSFramework.Maps.Event.Marker {
    /**
     * Class that will make sure that the trigger invokes the handlers
     * with the correct parameters.
     *
     * @abstract
     * @class AbstractMarkerEvent
     * @extends {AbstractEvent<string>}
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    export abstract class AbstractMarkerEvent extends AbstractEvent<string> {
        // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
        public trigger(
            mapId: string,
            markerId: string,
            // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
            ...args: any
        ): void {
            this.handlers
                .slice(0)
                .forEach((h) =>
                    Helper.CallbackAsyncInvocation(h, mapId, markerId, ...args)
                );
        }
    }
}
