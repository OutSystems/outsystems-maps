// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace Provider.Maps.Leaflet.Feature {
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

                let marker = JSON.parse(pointCoordinates);
                let polyPoints = [];
                let isSuccess = false;

                // Check if marker is inside shape based on shape element
                if (shapeId) {
                    const shape =
                        OutSystems.Maps.MapAPI.ShapeManager.GetShapeById(
                            shapeId
                        );

                    // Exception added for circle
                    if (shape.type === OSFramework.Maps.Enum.ShapeType.Circle) {
                        const circleCenter = shape.provider.getLatLng();
                        const circleRadius = shape.provider.getRadius();
                        marker = L.latLng(marker.Lat, marker.Lng);
                        const distanceBetweenPoints = map.provider.distance(
                            marker,
                            circleCenter
                        );

                        // Check if circle contains the marker coordinates
                        isInsideShape = distanceBetweenPoints < circleRadius;
                        isSuccess = true;
                    } else {
                        // Check if shape contains marker based on shape type
                        if (
                            shape.type ===
                            OSFramework.Maps.Enum.ShapeType.Polyline
                        ) {
                            polyPoints = shape.provider.getLatLngs();
                        } else {
                            polyPoints = shape.provider.getLatLngs()[0];
                        }

                        // axis points to compare the shape coordinates
                        let xi;
                        let yi;
                        let xj;
                        let yj;
                        let intersect;
                        let previousPolyPoint = polyPoints.length - 1;

                        // eslint-disable-next-line @typescript-eslint/no-unused-vars
                        for (const { index, value } of polyPoints.map(
                            (value, index) => ({
                                index,
                                value
                            })
                        )) {
                            // Check if the index of polyPoints is higher then the length
                            // If true, set it to the first index element
                            if (previousPolyPoint > polyPoints.length - 1) {
                                previousPolyPoint = index - 1;
                            }

                            // Set the axis coordinates to compare
                            xi = polyPoints[index].lat;
                            yi = polyPoints[index].lng;
                            xj = polyPoints[previousPolyPoint].lat;
                            yj = polyPoints[previousPolyPoint].lng;

                            // Check the intersection of the points based on axis coordinates
                            intersect =
                                yi > marker.Lng !== yj > marker.Lng &&
                                marker.Lat <
                                    ((xj - xi) * (marker.Lng - yi)) /
                                        (yj - yi) +
                                        xi;

                            // Check if has intersection with each point on shape
                            if (intersect) {
                                isInsideShape = !isInsideShape;
                            }

                            // Increment the previousPolyPoint to compare with the next coordinate
                            previousPolyPoint = ++previousPolyPoint;
                        }
                        isSuccess = true;
                    }
                } else {
                    const shapeCoordinatesList = JSON.parse(coordinatesList);

                    // To create a shape we need at least 3 coordinates
                    if (shapeCoordinatesList.length >= 3) {
                        shapeCoordinatesList.forEach((item) => {
                            polyPoints.push(L.latLng(item.Lat, item.Lng));
                        });
                    } else {
                        isSuccess = false;
                        returnMessage = {
                            isSuccess: false,
                            code: OSFramework.Maps.Enum.ErrorCodes
                                .CFG_InvalidPolygonShapeLocations
                        };
                    }
                }

                returnMessage = {
                    isSuccess: isSuccess,
                    code: isSuccess
                        ? OSFramework.Maps.Enum.ErrorCodes
                              .CFG_InvalidPolygonShapeLocations
                        : OSFramework.Maps.Enum.ErrorCodes
                              .CFG_InvalidPolygonShapeLocations,
                    message: isInsideShape.toString()
                };
            }

            return returnMessage;
        }

        // eslint-disable-next-line @typescript-eslint/no-empty-function
        public dispose(): void {}
    }
}
