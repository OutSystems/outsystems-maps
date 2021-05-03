// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace OSFramework.Event.OSMap {
    /**
     * Class that will make sure that the trigger invokes the handlers
     * with the correct parameters.
     *
     * @abstract
     * @class AbstractMapEvent
     * @extends {AbstractEvent<OSFramework.Map.IMap>}
     */
    export abstract class AbstractMapEvent extends OSFramework.Event
        .AbstractEvent<OSFramework.OSMap.IMap> {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        public trigger(
            mapObj: OSFramework.OSMap.IMap,
            mapId: string,
            ...args
        ): void {
            this.handlers.slice(0).forEach((h) => h(mapId, mapObj));
        }
    }
}
