// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace GoogleProvider.Feature {
    export class Offset
        implements
            OSFramework.Feature.IOffset,
            OSFramework.Interface.IBuilder {
        private _map: GoogleProvider.Map.IMapGoogle;
        private _offset: OSFramework.OSStructures.OSMap.Offset;

        constructor(map: GoogleProvider.Map.IMapGoogle, offset: OSFramework.OSStructures.OSMap.Offset) {
            this._map = map;
            this._offset = offset || {offsetX: 0, offsetY: 0};
        }

        public get getOffset(): OSFramework.OSStructures.OSMap.Offset {
            return this._offset;
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
            this._map.provider.panBy(value.offsetX, value.offsetY)
        }
    }
}
