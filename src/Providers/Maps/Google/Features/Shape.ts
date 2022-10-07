// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace Provider.Maps.Google.Feature {
    export class Shape
        implements
            OSFramework.Maps.Feature.IShape,
            OSFramework.Maps.Interface.IBuilder,
            OSFramework.Maps.Interface.IDisposable
    {
        private _isEnabled: boolean;
        private _map: OSMap.IMapGoogle;

        constructor(map: OSMap.IMapGoogle) {
            this._map = map;
            this._isEnabled = false;
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
            const map = OutSystems.Maps.MapAPI.MapManager.GetMapById(mapId);

            if (map) {
                let isInsideShape = '';
                const markerCoordinates = JSON.parse(
                    pointCoordinates.toLowerCase()
                );
                const markerLocation = new google.maps.LatLng(
                    markerCoordinates.Lat,
                    markerCoordinates.Lng
                );

                // Check if marker is inside shape based on shape element
                if (shapeId) {
                    isInsideShape = google.maps.geometry.poly
                        .containsLocation(
                            markerLocation,
                            map.getShape(shapeId).provider
                        )
                        .toString();
                } else {
                    const shapeCoordinatesList = JSON.parse(
                        coordinatesList.toLowerCase()
                    );

                    // To create a shape we need at least 3 coordinates
                    if (shapeCoordinatesList.length >= 3) {
                        const newShape = new google.maps.Polygon({
                            paths: shapeCoordinatesList
                        });

                        isInsideShape = google.maps.geometry.poly
                            .containsLocation(markerLocation, newShape)
                            .toString();
                    } else {
                        return {
                            isSuccess: false,
                            code: OSFramework.Maps.Enum.ErrorCodes
                                .CFG_InvalidPolygonShapeLocations
                        };
                    }
                }

                // Check if the validations of shape was applied
                if (isInsideShape !== '') {
                    return {
                        isSuccess: true,
                        message: isInsideShape
                    };
                } else {
                    return {
                        isSuccess: false,
                        code: OSFramework.Maps.Enum.ErrorCodes
                            .API_FailedContainsLocation
                    };
                }
            } else {
                return {
                    isSuccess: false,
                    code: OSFramework.Maps.Enum.ErrorCodes.CFG_InvalidMapId
                };
            }
        }

        public dispose(): void {
            //
        }
    }
}
