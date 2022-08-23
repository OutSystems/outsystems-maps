// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace Provider.Maps.Google.Feature {
    export class TrafficLayer
        implements
            OSFramework.Maps.Feature.ITrafficLayer,
            OSFramework.Maps.Interface.IBuilder,
            OSFramework.Maps.Interface.IDisposable
    {
        private _enabled: boolean;
        private _map: OSMap.IMapGoogle;
        private _trafficLayer: google.maps.TrafficLayer;

        constructor(map: OSMap.IMapGoogle, enabled: boolean) {
            this._map = map;
            this._enabled = enabled;
        }

        public get isEnabled(): boolean {
            return this._enabled;
        }
        public build(): void {
            this._trafficLayer = new google.maps.TrafficLayer();
            this.setState(this._enabled);
        }
        public dispose(): void {
            this._trafficLayer = undefined;
        }
        public setState(value: boolean): void {
            this._trafficLayer.setMap(
                value === true ? this._map.provider : null
            );
            this._enabled = value;
        }
    }
}
