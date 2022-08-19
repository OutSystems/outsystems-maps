// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace Provider.Maps.Leaflet.Feature {
    export class Offset
        implements
            OSFramework.Maps.Feature.IOffset,
            OSFramework.Maps.Interface.IBuilder
    {
        private _map: OSMap.IMapLeaflet;
        /** Current offset of the Map */
        private _offset: OSFramework.Maps.OSStructures.OSMap.Offset;

        constructor(
            map: OSMap.IMapLeaflet,
            offset: OSFramework.Maps.OSStructures.OSMap.Offset
        ) {
            this._map = map;
            this._offset = offset || { offsetX: 0, offsetY: 0 };
        }

        public get getOffset(): OSFramework.Maps.OSStructures.OSMap.Offset {
            return this._offset;
        }

        // eslint-disable-next-line @typescript-eslint/no-empty-function
        public build(): void {}

        public setOffset(
            value: OSFramework.Maps.OSStructures.OSMap.Offset
        ): void {
            this._offset = {
                offsetX: value.offsetX || 0,
                offsetY: value.offsetY || 0
            };

            // get center coordinates into point
            const point = this._map.provider.latLngToLayerPoint(
                this._map.features.center.getCurrentCenter()
            );

            // calculate the new center point + offset
            const newPoint = new L.Point(
                point.x + this._offset.offsetX,
                point.y + this._offset.offsetY
            );
            // convert the new point into coordinates
            const latLng = this._map.provider.layerPointToLatLng(newPoint);

            // Set the map view to the new coordinates
            this._map.provider.setView(latLng);
        }
    }
}
