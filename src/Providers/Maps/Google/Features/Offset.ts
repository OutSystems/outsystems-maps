// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace Provider.Maps.Google.Feature {
    export class Offset
        implements
            OSFramework.Maps.Feature.IOffset,
            OSFramework.Maps.Interface.IBuilder
    {
        private _map: OSMap.IMapGoogle;
        /** Current offset of the Map */
        private _offset: OSFramework.Maps.OSStructures.OSMap.Offset;

        constructor(
            map: OSMap.IMapGoogle,
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
            this._map.provider.panTo(
                this._map.features.center.getCurrentCenter()
            );
            this._map.provider.panBy(
                this._offset.offsetX,
                this._offset.offsetY
            );
        }
    }
}
