// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace Provider.Maps.Google.Feature {
    export class Shape
        implements
            OSFramework.Maps.Feature.IShape,
            OSFramework.Maps.Interface.IBuilder
    {
        private _isInsideShape: boolean;
        private _map: OSFramework.Maps.OSMap.IMap;
        private _markerCoordinates;
        private _returnObjCode: string;
        private _returnObjMessage: string;
        private _returnObjSuccess: boolean;
        private _shape: OSFramework.Maps.Shape.IShape;

        // Method for shape circle exception
        private _checkCircleContainsMarker(): void {
            const circleRadius = this._shape.provider.getRadius();
            const circleCenter = this._shape.provider.getCenter();
            const distanceBetweenPoints =
                google.maps.geometry.spherical.computeDistanceBetween(
                    this._markerCoordinates,
                    circleCenter
                );

            this._isInsideShape = distanceBetweenPoints <= circleRadius;
            this._returnObjSuccess = true;
            this._returnObjCode = OSFramework.Maps.Enum.Success.code;
            this._returnObjMessage = this._isInsideShape.toString();
        }

        // Method to apply the default calculations for shapes
        private _checkContainsMarker(): void {
            this._isInsideShape = google.maps.geometry.poly.containsLocation(
                this._markerCoordinates,
                this._map.getShape(this._shape.widgetId).provider
            );
            this._returnObjSuccess = true;
            this._returnObjCode = OSFramework.Maps.Enum.Success.code;
            this._returnObjMessage = this._isInsideShape.toString();
        }

        // Method for shape rectangle exception
        private _checkRectangleContainsMarker(): void {
            this._isInsideShape = this._map
                .getShape(this._shape.widgetId)
                .provider.getBounds()
                .contains(this._markerCoordinates);
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

                // Convert to JSON the marker location before to convert to google format
                this._markerCoordinates = JSON.parse(pointCoordinates);
                this._markerCoordinates = new google.maps.LatLng(
                    this._markerCoordinates.Lat,
                    this._markerCoordinates.Lng
                );

                // Check if marker is inside shape based on shape element
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
                        case OSFramework.Maps.Enum.ShapeType.Rectangle:
                            this._checkRectangleContainsMarker();
                            break;
                        case OSFramework.Maps.Enum.ShapeType.Circle:
                            this._checkCircleContainsMarker();
                            break;

                        default: {
                            this._checkContainsMarker();
                        }
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

                        // Set hidden a shape into the existing map to validate if the marker is inside
                        newShape.setMap(null);
                        this._isInsideShape =
                            google.maps.geometry.poly.containsLocation(
                                this._markerCoordinates,
                                newShape
                            );
                        this._returnObjSuccess = true;
                        this._returnObjCode =
                            OSFramework.Maps.Enum.Success.code;
                        this._returnObjMessage = this._isInsideShape.toString();
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
