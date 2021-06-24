///<reference path="AbstractMapEvent.ts"/>

// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace OSFramework.Event.OSMap {
    /**
     * Class that represents the the Initialized event.
     *
     * @class MapOnError
     * @extends {AbstractEvent<OSFramework.OSMap.IMap>}
     */
    export class MapOnError extends AbstractMapEvent {
        /**
         * Method that will trigger the event with the correct parameters.
         * @param mapObj Map that is raising the event
         * @param mapId Id of the Map that is raising the event
         * @param eventName Name of the event that got raised
         * @param errorMessage Extra error messages that might come from errors that occurred using the Provider APIs
         */
        public trigger(
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            mapObj: OSFramework.OSMap.IMap,
            mapId: string,
            eventName: string,
            errorMessage?: string
        ): void {
            this.handlers
                .slice(0)
                .forEach((h) => h(mapObj, mapId, eventName, errorMessage));
        }
    }
}
