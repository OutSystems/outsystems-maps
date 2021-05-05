// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace GoogleProvider.Feature {
    export class Center
        implements
            OSFramework.Feature.ICenter,
            OSFramework.Interface.IBuilder {
        private _map: GoogleProvider.Map.IMapGoogle;
        private _currentCenter: OSFramework.OSStructures.OSMap.Coordinates;

        constructor(map: GoogleProvider.Map.IMapGoogle, center: OSFramework.OSStructures.OSMap.Coordinates) {
            this._map = map;
            this._currentCenter = center;
        }

        private _setCenter(value: OSFramework.OSStructures.OSMap.Coordinates): void {
            // Save the new value as the new center
            this._currentCenter = value;

            const coordinates = new google.maps.LatLng(
                value.lat,
                value.lng
            );
            this._map.provider.setCenter(coordinates);
        }

        public build(): void {
            this._setCenter(this._currentCenter);
        }

        public getCenter(): OSFramework.OSStructures.OSMap.Coordinates {
            return this._currentCenter;
        }

        public updateCenter(location: string): void {
            GoogleProvider.Helper.Conversions.ConvertToCoordinates(location, this._map.config.apiKey).then(response => {
                this._map.config.center = response;
                this._setCenter(this._map.config.center);
            });
        }
    }
}
