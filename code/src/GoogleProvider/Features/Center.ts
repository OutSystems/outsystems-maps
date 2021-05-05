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

        private _convertCoordinates(location: string | OSFramework.OSStructures.OSMap.Coordinates): Promise<OSFramework.OSStructures.OSMap.Coordinates> {
            if (typeof location !== 'undefined' && typeof location === 'string') {
                return GoogleProvider.Helper.Conversions.ConvertLocationToCoordinates(location, this._map.config.apiKey);
            }else{
                throw new Error("Invalid location.");
            }
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

        public updateCenter(location: string | OSFramework.OSStructures.OSMap.Coordinates): void {
            this._convertCoordinates(location).then(response => {
                this._map.config.center = response;
                this._setCenter(this._map.config.center);
            });
        }
    }
}
