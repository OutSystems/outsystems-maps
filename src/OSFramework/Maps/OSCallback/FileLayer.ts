/**
 * Namespace that contains the callbacks signatures to be passed in FileLayer events.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace OSFramework.Maps.Callbacks.FileLayer {
    /**
     * This is the callback signature for events triggered by FileLayers.
     * @param {string} mapId id of the Map where the FileLayer that triggered the event belongs to
     * @param {string} fileLayerId id of the FileLayer that triggered the event
     * @param {OSFramework.Maps.FileLayer.FileLayer} fileLayerObj object of the FileLayer that triggered the event
     */
    export type Event = {
        (
            mapId: string,
            fileLayerId: string,
            fileLayerObj: OSFramework.Maps.FileLayer.IFileLayer,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ...args: any
        ): void;
    };
}
