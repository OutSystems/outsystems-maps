// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace GoogleProvider.Feature {
    export class Offset
        implements
            OSFramework.Feature.IOffset,
            OSFramework.Interface.IBuilder {
        private _map: GoogleProvider.Map.IMapGoogle;
        private _offset: OSFramework.OSStructures.OSMap.Offset;
        private _autoFit: boolean;

        constructor(map: GoogleProvider.Map.IMapGoogle, offset: OSFramework.OSStructures.OSMap.Offset, autofit: boolean) {
            this._map = map;
            this._offset = offset || {offsetX: 0, offsetY: 0};
            this._autoFit = autofit || false;
        }

        public get getOffset(): OSFramework.OSStructures.OSMap.Offset {
            return this._offset;
        }

        public get isAutoFit(): boolean {
            return this._autoFit;
        }

        public build(): void {
            this.setOffset(this._offset);
        }

        public setOffset(value: OSFramework.OSStructures.OSMap.Offset): void {
            // The offset of the map should be the sum of the previous offSet and the new one
            this._offset = {
                offsetX: value.offsetX + this._offset.offsetX, 
                offsetY: value.offsetY + this._offset.offsetY
            }
            this._map.provider.panBy(value.offsetX, value.offsetY);
        }

        public setAutoFit(state: boolean): void {
            this._autoFit = state;
            if(state === true) {
                // Set behavior for autofit mode
                const bounds = new google.maps.LatLngBounds();
                const map = this._map;
                const markers = map.getMarkers();
                
                let loc: google.maps.LatLng;
                if (markers.length === 1) {
                    loc = new google.maps.LatLng(
                        markers[0].provider.position.lat(),
                        markers[0].provider.position.lng()
                    );
                    bounds.extend(loc);
                    map.provider.fitBounds(bounds);
                    map.changeProperty('center', loc);
                    map.changeProperty('zoom', 8);
                } else if (markers.length >= 2) {
                    markers.forEach(function (item) {
                        loc = new google.maps.LatLng(
                            item.provider.position.lat(),
                            item.provider.position.lng()
                        );
                        bounds.extend(loc);
                    });
                    map.provider.fitBounds(bounds);
                    map.provider.panToBounds(bounds);
                } else {
                    return;
                }
            } else {
                // Set behavior for disabled autofit mode
                return;
            }
        }
    }
}
