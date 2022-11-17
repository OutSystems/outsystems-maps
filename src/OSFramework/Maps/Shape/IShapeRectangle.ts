// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace OSFramework.Maps.Shape {
    export interface IShapeRectangle extends IShape {
        /** Bounds from the current shape */
        bounds: OSStructures.OSMap.Bounds;
    }
}
