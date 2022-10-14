// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace Provider.Maps.Google.Feature {
    export class Shape
        implements
            OSFramework.Maps.Feature.IShape,
            OSFramework.Maps.Interface.IBuilder,
            OSFramework.Maps.Interface.IDisposable
    {
        public build(): void {
            //
        }

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
                let renderedSuccessfully = false;

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
                        shape.type === OSFramework.Maps.Enum.ShapeType.Polyline
                    ) {
                        // The Polyline is an unsupported shape to use the ContainsLocation API
                        returnMessage = {
                            isSuccess: renderedSuccessfully,
                            code: OSFramework.Maps.Enum.Unsupported.code,
                            message: OSFramework.Maps.Enum.Unsupported.message
                        };
                        return returnMessage;
                    } else if (
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
                    renderedSuccessfully = true;
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
                    }
                }
                returnMessage = {
                    isSuccess: renderedSuccessfully,
                    code: renderedSuccessfully
                        ? OSFramework.Maps.Enum.Success.code
                        : OSFramework.Maps.Enum.ErrorCodes
                              .CFG_InvalidPolygonShapeLocations,
                    message: renderedSuccessfully
                        ? isInsideShape.toString()
                        : OSFramework.Maps.Enum.Success.message
                };
            }

            return returnMessage;
        }

        public dispose(): void {
            //
        }
    }
}
