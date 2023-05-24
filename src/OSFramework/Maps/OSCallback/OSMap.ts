/**
 * Namespace that contains the callbacks signatures to be passed in the Map events.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace OSFramework.Maps.Callbacks.OSMap {
    /**
     * This is the callback signature for events triggered by the Map.
     * @param {string} mapId which Map triggered the event
     * @param {OSFramework.Maps.OSMap.IMap} mapObj object of the Map which triggered the event
     */
    export type Event = {
        (mapObj: OSFramework.Maps.OSMap.IMap, mapId: string): void;
    };
}
