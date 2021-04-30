// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace GoogleProvider.Feature {
    export class StaticMap
        implements
            OSFramework.Feature.IStaticMap,
            OSFramework.Interface.IBuilder {
        private _map: GoogleProvider.Map.IMapGoogle;
        private _enabled: boolean;

        constructor(map: GoogleProvider.Map.IMapGoogle, enabled: boolean) {
            this._map = map;
            this._enabled = enabled;
        }

        public get isEnabled(): boolean {
            return this._enabled;
        }
        public build(): void {
            this.setState(this._enabled);
        }
        public setState(value: boolean): void {
            this._enabled = value;
        }
    }
}
