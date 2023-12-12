// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace Provider.Maps.Google.Feature {
    export class Zoom
        implements
            OSFramework.Maps.Feature.IZoom,
            OSFramework.Maps.Interface.IBuilder
    {
        /** Boolean that indicates whether the Map is using Autofit (Zoom = Auto) or not */
        private _autofitEnabled: boolean;
        /** Current Zoom level of the Map that changes whenever a marker is added or by enabling the Autofit on Zoom feature */
        private _level: OSFramework.Maps.Enum.OSMap.Zoom;
        private _map: OSMap.IMapGoogle;

        constructor(
            map: OSMap.IMapGoogle,
            level: OSFramework.Maps.Enum.OSMap.Zoom
        ) {
            this._map = map;
            this._level = level;
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

        private _setBounds() {
            const bounds = new google.maps.LatLngBounds();
            this._map.markers.forEach(function (item) {
                if (item.provider === undefined) return;
                const loc = item.provider.position.toJSON();
                bounds.extend(loc);
            });
            // instead of using the getPath, try to use:
            // this._map.shapes[0]._buildPath(this._map.shapes[0].config.locations).then((loc) => {bounds.extend(loc)})
            this._map.shapes
                .filter((item) => item.config.autoZoomOnShape)
                .forEach(function (item) {
                    if (item.provider === undefined) return;
                    const loc = item.providerBounds;
                    bounds.union(loc);
                });
            this._map.provider.fitBounds(bounds);
            this._map.provider.panToBounds(bounds);
            this._map.features.center.setCurrentCenter(
                this._map.provider.getCenter()
            );
        }

        public get isAutofit(): boolean {
            return this._autofitEnabled;
        }

        public get level(): OSFramework.Maps.Enum.OSMap.Zoom {
            return this._level;
        }

        public refreshZoom(): void {
            const hasZoomOnMarkers =
                this._map.markers.filter((item) => item.config.autoZoomOnShape)
                    .length > 1;
            const hasZoomOnShapes = this._map.shapes.some(
                (item) => item.config.autoZoomOnShape
            );
            if (this._map.features.zoom.isAutofit) {
                if (hasZoomOnMarkers || hasZoomOnShapes) {
                    this._setBounds();
                } else {
                    this._map.provider.setZoom(
                        OSFramework.Maps.Helper.Constants.zoomAutofit
                    );
                }
            } else {
                this._map.provider.setZoom(this._map.features.zoom.level);
            }
        }

        public setLevel(value: OSFramework.Maps.Enum.OSMap.Zoom): void {
            this._level = value;
            this._setAutofit(value === OSFramework.Maps.Enum.OSMap.Zoom.Auto);
            this._map.refresh();
        }
    }
}
