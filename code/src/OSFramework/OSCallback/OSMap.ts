/**
 * Namespace that contains the callbacks signatures to be passed in the Map events.
 */
 namespace OSFramework.Callbacks.OSMap {
    /**
     * This is the callback signature for events triggerend by the Map.
     * @param {string} mapId which Map triggered the event
     * @param {OSFramework.OSMap.IMap} mapObj object of the Map which triggered the event
     */
    export type Event = {
        (mapId: string, mapObj: OSFramework.OSMap.IMap): void;
    };
}
