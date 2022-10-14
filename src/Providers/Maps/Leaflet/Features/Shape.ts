// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace Provider.Maps.Leaflet.Feature {
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

                let marker = JSON.parse(pointCoordinates);
                let polyPoints = [];

                // Check if marker is inside shape based on shape element
                if (shapeId) {
                    const shape =
                        OutSystems.Maps.MapAPI.ShapeManager.GetShapeById(
                            shapeId
                        );
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
                    }
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
                        renderedSuccessfully = true;
                    } else {
                        // Check if shape contains marker based on shape type
                        polyPoints = shape.provider.getLatLngs()[0];

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
                        renderedSuccessfully = true;
                    }
                } else {
                    const shapeCoordinatesList = JSON.parse(coordinatesList);

                    // To create a shape we need at least 3 coordinates
                    if (shapeCoordinatesList.length >= 3) {
                        shapeCoordinatesList.forEach((item) => {
                            polyPoints.push(L.latLng(item.Lat, item.Lng));
                        });
                    } else {
                        renderedSuccessfully = false;
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
