/**
 * Namespace that contains the callbacks signatures to be passed in Shape events.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace OSFramework.Maps.Callbacks.Shape {
    /**
     * This is the callback signature for events triggered by Shapes.
     * @param {string} mapId id of the Map where the Shape that triggered the event belongs to
     * @param {string} shapeId id of the Shape that triggered the event
     * @param {OSFramework.Maps.Shape.Shape} shapeObj object of the Shape that triggered the event
     */
    export type Event = {
        (
            mapId: string,
            shapeId: string,
            shapeObj: OSFramework.Maps.Shape.IShape,
            ...args: unknown[]
        ): void;
    };
}
