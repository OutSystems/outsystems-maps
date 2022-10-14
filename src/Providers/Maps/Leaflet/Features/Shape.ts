// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace Provider.Maps.Leaflet.Feature {
    export class Shape
        implements
            OSFramework.Maps.Feature.IShape,
            OSFramework.Maps.Interface.IBuilder,
            OSFramework.Maps.Interface.IDisposable
    {
        private _isInsideShape = false;
        private _map;
        private _marker;
        private _renderedSuccessfully = false;
        private _shape;

        // Method for shape circle exception
        private _shapeCircle(): void {
            const circleCenter = this._shape.provider.getLatLng();
            const circleRadius = this._shape.provider.getRadius();
            this._marker = L.latLng(this._marker.Lat, this._marker.Lng);
            const distanceBetweenPoints = this._map.provider.distance(
                this._marker,
                circleCenter
            );

            // Check if circle contains the marker coordinates
            this._isInsideShape = distanceBetweenPoints < circleRadius;
            this._renderedSuccessfully = true;
        }

        // Method to apply the default calculations for shapes
        private _shapeDefault(): void {
            // Check if shape contains marker based on shape type
            const polyPoints = this._shape.provider.getLatLngs()[0];

            // axis points to compare the shape coordinates
            let xi;
            let yi;
            let xj;
            let yj;
            let intersect;
            let previousPolyPoint = polyPoints.length - 1;

            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            for (const { index } of polyPoints.map((value, index) => ({
                value,
                index
            }))) {
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
                    yi > this._marker.Lng !== yj > this._marker.Lng &&
                    this._marker.Lat <
                        ((xj - xi) * (this._marker.Lng - yi)) / (yj - yi) + xi;

                // Check if has intersection with each point on shape
                if (intersect) {
                    this._isInsideShape = !this._isInsideShape;
                }

                // Increment the previousPolyPoint to compare with the next coordinate
                previousPolyPoint = ++previousPolyPoint;
            }
            this._renderedSuccessfully = true;
        }
        public build(): void {
            //
        }

        // Checkk if marker is inside of provided shape
        public containsLocation(
            mapId: string,
            shapeId: string,
            pointCoordinates: string,
            coordinatesList: string
        ): OSFramework.Maps.OSStructures.ReturnMessage {
            this._map = OutSystems.Maps.MapAPI.MapManager.GetMapById(mapId);
            // Set the default return message to prevent different else if's
            let returnMessage: OSFramework.Maps.OSStructures.ReturnMessage = {
                isSuccess: false,
                code: OSFramework.Maps.Enum.ErrorCodes.CFG_InvalidMapId
            };

            // Check if map exists
            if (this._map) {
                this._marker = JSON.parse(pointCoordinates);

                // Check if marker is inside shape based on shape element
                if (shapeId) {
                    this._shape =
                        OutSystems.Maps.MapAPI.ShapeManager.GetShapeById(
                            shapeId
                        );

                    switch (this._shape.type) {
                        case OSFramework.Maps.Enum.ShapeType.Polyline:
                            // The Polyline is an unsupported shape to use the ContainsLocation API

                            return (returnMessage = {
                                isSuccess: this._renderedSuccessfully,
                                code: OSFramework.Maps.Enum.Unsupported.code,
                                message:
                                    OSFramework.Maps.Enum.Unsupported.message
                            });
                        case OSFramework.Maps.Enum.ShapeType.Circle: {
                            this._shapeCircle();
                            break;
                        }
                        default: {
                            this._shapeDefault();
                        }
                    }
                } else {
                    const shapeCoordinatesList = JSON.parse(coordinatesList);
                    const polyPoints = [];

                    // To create a shape we need at least 3 coordinates
                    if (shapeCoordinatesList.length >= 3) {
                        shapeCoordinatesList.forEach((item) => {
                            polyPoints.push(L.latLng(item.Lat, item.Lng));
                        });
                    }
                }
                returnMessage = {
                    isSuccess: this._renderedSuccessfully,
                    code: this._renderedSuccessfully
                        ? OSFramework.Maps.Enum.Success.code
                        : OSFramework.Maps.Enum.ErrorCodes
                              .CFG_InvalidPolygonShapeLocations,
                    message: this._renderedSuccessfully
                        ? this._isInsideShape.toString()
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
