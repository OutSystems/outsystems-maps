// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace OSFramework.Maps.Feature {
    export interface IShape {
        // Check if the marker is inside shape and expose the result
        containsLocation(
            mapId: string,
            shapeId: string,
            pointCoordinates: string,
            coordinatesList: string
        ): OSStructures.ReturnMessage;
    }
}
