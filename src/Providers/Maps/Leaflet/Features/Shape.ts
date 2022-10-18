// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace Provider.Maps.Leaflet.Feature {
    export class Shape
        implements
            OSFramework.Maps.Feature.IShape,
            OSFramework.Maps.Interface.IBuilder
    {
        private _isInsideShape: boolean;
        private _map: OSFramework.Maps.OSMap.IMap;
        private _markerCoordinates: L.LatLng;
        private _polyPoints: L.LatLng[];
        private _returnObjCode: string;
        private _returnObjMessage: string;
        private _returnObjSuccess: boolean;
        private _shape: OSFramework.Maps.Shape.IShape;

        // Method for shape circle exception
        private _checkCircleInsideMarker(): void {
            const circleCenter = this._shape.provider.getLatLng();
            const circleRadius = this._shape.provider.getRadius();
            this._markerCoordinates = new L.LatLng(
                this._markerCoordinates.lat,
                this._markerCoordinates.lng
            );
            const distanceBetweenPoints = this._map.provider.distance(
                this._markerCoordinates,
                circleCenter
            );

            // Check if circle contains the marker coordinates
            this._isInsideShape = distanceBetweenPoints < circleRadius;
            this._returnObjSuccess = true;
            this._returnObjCode = OSFramework.Maps.Enum.Success.code;
            this._returnObjMessage = this._isInsideShape.toString();
        }

        // Method to apply the default calculations for shapes
        private _checkInsideMarker(): void {
            // axis points to compare the shape coordinates
            let xi;
            let yi;
            let xj;
            let yj;
            let intersect;
            let previousPolyPoint = this._polyPoints.length - 1;

            for (const { index } of this._polyPoints.map((value, index) => ({
                value,
                index
            }))) {
                // Check if the index of polyPoints is higher then the length
                // If true, set it to the first index element
                if (previousPolyPoint > this._polyPoints.length - 1) {
                    previousPolyPoint = index - 1;
                }

                // Set the axis coordinates to compare
                xi = this._polyPoints[index].lat;
                yi = this._polyPoints[index].lng;
                xj = this._polyPoints[previousPolyPoint].lat;
                yj = this._polyPoints[previousPolyPoint].lng;

                // Check the intersection of the points based on axis coordinates
                intersect =
                    yi > this._markerCoordinates.lng !==
                        yj > this._markerCoordinates.lng &&
                    this._markerCoordinates.lat <
                        ((xj - xi) * (this._markerCoordinates.lng - yi)) /
                            (yj - yi) +
                            xi;

                // Check if has intersection with each point on shape
                if (intersect) {
                    this._isInsideShape = !this._isInsideShape;
                }

                // Increment the previousPolyPoint to compare with the next coordinate
                previousPolyPoint = ++previousPolyPoint;
            }
            this._returnObjSuccess = true;
            this._returnObjCode = OSFramework.Maps.Enum.Success.code;
            this._returnObjMessage = this._isInsideShape.toString();
        }
        public build(): void {
            //
        }

        public containsLocation(
            mapId: string,
            shapeId: string,
            pointCoordinates: string,
            coordinatesList: string
        ): OSFramework.Maps.OSStructures.ReturnMessage {
            this._map = OutSystems.Maps.MapAPI.MapManager.GetMapById(mapId);
            // Set the default return message to prevent different else if's
            this._returnObjSuccess = false;
            this._returnObjCode =
                OSFramework.Maps.Enum.ErrorCodes.CFG_InvalidMapId;

            // Check if map exists
            if (this._map) {
                this._isInsideShape = false;
                this._markerCoordinates = JSON.parse(
                    pointCoordinates.toLocaleLowerCase()
                );

                // Check if shape exists
                if (shapeId) {
                    this._shape =
                        OutSystems.Maps.MapAPI.ShapeManager.GetShapeById(
                            shapeId
                        );

                    // Check if shape contains marker based on shape type
                    switch (this._shape.type) {
                        case OSFramework.Maps.Enum.ShapeType.Polyline:
                            // The Polyline is an unsupported shape to use the ContainsLocation API
                            this._returnObjCode =
                                OSFramework.Maps.Enum.Unsupported.code;
                            this._returnObjMessage =
                                OSFramework.Maps.Enum.Unsupported.message;
                            break;
                        case OSFramework.Maps.Enum.ShapeType.Circle: {
                            this._checkCircleInsideMarker();
                            break;
                        }
                        default: {
                            // Default validations to check if marker is inside shape
                            this._polyPoints =
                                this._shape.provider.getLatLngs()[0];
                            this._checkInsideMarker();
                        }
                    }
                } else {
                    const shapeCoordinatesList = JSON.parse(coordinatesList);
                    this._polyPoints = [];

                    // To create a shape we need at least 3 coordinates
                    if (shapeCoordinatesList.length >= 3) {
                        shapeCoordinatesList.forEach((item) => {
                            this._polyPoints.push(L.latLng(item.Lat, item.Lng));
                        });

                        this._checkInsideMarker();
                    }
                }
            }
            // Set the return message to expose values
            return {
                isSuccess: this._returnObjSuccess,
                code: this._returnObjCode,
                message: this._returnObjMessage
            };
        }
    }
}
