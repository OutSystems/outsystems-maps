// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace Provider.Maps.Google.Feature {
    export class Zoom
        implements
            OSFramework.Maps.Feature.IZoom,
            OSFramework.Maps.Interface.IBuilder
    {
        /** Boolean that indicates whether the Map is using Autofit (Zoom = Auto) or not */
        private _autofitEnabled: boolean;
        private _isInitiated: boolean;
        /** Current Zoom level of the Map that changes whenever a marker is added or by enabling the Autofit on Zoom feature */
        private _level: OSFramework.Maps.Enum.OSMap.Zoom;
        private _map: OSMap.IMapGoogle;

        constructor(
            map: OSMap.IMapGoogle,
            level: OSFramework.Maps.Enum.OSMap.Zoom
        ) {
            this._map = map;
            this._level = level;
            this._isInitiated = false;
        }

        /** Set as autofit if Zoom's level is Auto */
        private _setAutofit(value: boolean): void {
            this._autofitEnabled = value;
        }

        public build(): void {
            this._setAutofit(
                this._level === OSFramework.Maps.Enum.OSMap.Zoom.Auto
            );
        }

        public get isAutofit(): boolean {
            return this._autofitEnabled;
        }

        public get level(): OSFramework.Maps.Enum.OSMap.Zoom {
            return this._level;
        }

        public refreshZoom(): void {
            if (this._map.features.zoom.isAutofit) {
                const bounds = new google.maps.LatLngBounds();
                if (this._map.markers.length === 0) {
                    this._map.provider.setZoom(
                        OSFramework.Maps.Helper.Constants.zoomAutofit
                    );
                } else {
                    const filteredMarkers = this._map.markers.filter(
                        (marker) => {
                            return marker.config.blockAutoZoom === false;
                        }
                    );

                    if (filteredMarkers.length === 1) {
                        if (filteredMarkers[0].provider) {
                            this._map.provider.setCenter(
                                filteredMarkers[0].provider.getPosition()
                            );
                            this._map.features.center.setCurrentCenter(
                                this._map.provider.getCenter()
                            );
                        }
                        if (!this._isInitiated) {
                            this._isInitiated = true;
                            this._map.provider.setZoom(
                                OSFramework.Maps.Helper.Constants.zoomAutofit
                            );
                        }
                    } else if (filteredMarkers.length > 1) {
                        filteredMarkers.forEach((marker) => {
                            if (marker.provider === undefined) return;
                            const loc = marker.provider.position.toJSON();
                            bounds.extend(loc);
                        });
                        this._map.provider.fitBounds(bounds);
                        this._map.provider.panToBounds(bounds);
                        this._map.features.center.setCurrentCenter(
                            this._map.provider.getCenter()
                        );
                    }
                }
            } else {
                if (!this._isInitiated) {
                    this._isInitiated = true;
                    this._map.provider.setZoom(this._map.features.zoom.level);
                }
            }
        }

        public setLevel(value: OSFramework.Maps.Enum.OSMap.Zoom): void {
            this._level = value;
            this._setAutofit(value === OSFramework.Maps.Enum.OSMap.Zoom.Auto);
            this._map.refresh();
        }
    }
}
