// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace GoogleProvider.Feature {
    export class Center
        implements OSFramework.Feature.ICenter, OSFramework.Interface.IBuilder {
        /** Current center position of the Map that changes whenever a marker is added or by enabling the Autofit on Zoom feature */
        private _currentCenter: OSFramework.OSStructures.OSMap.Coordinates;
        /** Center position of the Map defined by the configuration
         * (can be changed after running the changeParameter method or is set by initializing the Map)
         */
        private _initialCenter: OSFramework.OSStructures.OSMap.Coordinates;
        private _map: Map.IMapGoogle;

        constructor(
            map: Map.IMapGoogle,
            center: OSFramework.OSStructures.OSMap.Coordinates
        ) {
            this._map = map;
            this._initialCenter = center;
        }

        // eslint-disable-next-line @typescript-eslint/no-empty-function
        public build(): void {}

        public getCenter(): OSFramework.OSStructures.OSMap.Coordinates {
            return this._initialCenter;
        }

        public getCurrentCenter(): OSFramework.OSStructures.OSMap.Coordinates {
            return this._currentCenter;
        }

        public refreshCenter(
            value: OSFramework.OSStructures.OSMap.Coordinates
        ): void {
            const coordinates = new google.maps.LatLng(value.lat, value.lng);
            this._map.provider.setCenter(coordinates);
            this._currentCenter = coordinates.toJSON();
        }

        public setCurrentCenter(
            value: OSFramework.OSStructures.OSMap.Coordinates
        ): void {
            this._currentCenter = value;
        }

        public updateCenter(location: string): void {
            Helper.Conversions.ConvertToCoordinates(
                location,
                this._map.config.apiKey
            )
                .then((response) => {
                    this._map.config.center = response;
                    this._initialCenter = response;
                    this._map.refresh();
                })
                .catch((error) => {
                    this._map.mapEvents.trigger(
                        OSFramework.Event.OSMap.MapEventType.OnError,
                        this._map,
                        OSFramework.Enum.ErrorCodes.LIB_FailedGeocodingMap,
                        `${error}`
                    );
                });
        }
    }
}
