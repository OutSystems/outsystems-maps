// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace OSFramework.Maps.Shape {
    export interface IShapePolyshape extends IShape {
        /** Path that defines the current shape */
        providerPath: Array<OSStructures.OSMap.Coordinates>;
    }
}
