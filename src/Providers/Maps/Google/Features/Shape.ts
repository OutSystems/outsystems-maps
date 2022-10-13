// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace Provider.Maps.Google.Feature {
    export class Shape
        implements
            OSFramework.Maps.Feature.IShape,
            OSFramework.Maps.Interface.IBuilder,
            OSFramework.Maps.Interface.IDisposable
    {
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        public build(): void {}

        public containsLocation(
            mapId: string,
            shapeId: string,
            pointCoordinates: string,
            coordinatesList: string
        ): OSFramework.Maps.OSStructures.ReturnMessage {
            const map = OutSystems.Maps.MapAPI.MapManager.GetMapById(mapId);
            // Set the default return message to prevent different else if's
            let returnMessage: OSFramework.Maps.OSStructures.ReturnMessage = {
                isSuccess: false,
                code: OSFramework.Maps.Enum.ErrorCodes.CFG_InvalidMapId
            };

            // Check if map exists
            if (map) {
                let isInsideShape = false;

                const markerCoordinates = JSON.parse(pointCoordinates);
                const markerLocation = new google.maps.LatLng(
                    markerCoordinates.Lat,
                    markerCoordinates.Lng
                );

                // Check if marker is inside shape based on shape element
                if (shapeId) {
                    const shape =
                        OutSystems.Maps.MapAPI.ShapeManager.GetShapeById(
                            shapeId
                        );

                    // Check if shape contains marker based on shape type
                    if (
                        shape.type === OSFramework.Maps.Enum.ShapeType.Rectangle
                    ) {
                        isInsideShape = map
                            .getShape(shapeId)
                            .provider.getBounds()
                            .contains(markerLocation);
                    } else if (
                        shape.type === OSFramework.Maps.Enum.ShapeType.Circle
                    ) {
                        const circleRadius = shape.provider.getRadius();
                        const circleCenter = shape.provider.getCenter();
                        const distanceBetweenPoints =
                            google.maps.geometry.spherical.computeDistanceBetween(
                                markerLocation,
                                circleCenter
                            );

                        isInsideShape = distanceBetweenPoints <= circleRadius;
                    } else {
                        isInsideShape =
                            google.maps.geometry.poly.containsLocation(
                                markerLocation,
                                map.getShape(shapeId).provider
                            );
                    }
                } else {
                    const shapeCoordinatesList = JSON.parse(
                        coordinatesList.toLowerCase()
                    );

                    // To create a shape we need at least 3 coordinates
                    if (shapeCoordinatesList.length >= 3) {
                        const newShape = new google.maps.Polygon({
                            paths: shapeCoordinatesList
                        });

                        isInsideShape =
                            google.maps.geometry.poly.containsLocation(
                                markerLocation,
                                newShape
                            );
                    } else {
                        returnMessage = {
                            isSuccess: false,
                            code: OSFramework.Maps.Enum.ErrorCodes
                                .CFG_InvalidPolygonShapeLocations
                        };
                    }
                }

                // Set the result checking if the shape contains the marker
                returnMessage = {
                    isSuccess: true,
                    message: isInsideShape.toString()
                };
            }

            return returnMessage;
        }

        // eslint-disable-next-line @typescript-eslint/no-empty-function
        public dispose(): void {}
    }
}
