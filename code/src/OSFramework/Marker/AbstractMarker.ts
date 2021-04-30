namespace OSFramework.Marker {
    export abstract class AbstractMarker<
        W,
        Z extends Configuration.IConfigurationMarker
    > implements IMarkerGeneric<W> {
        private _config: Configuration.IConfigurationMarker;
        private _isReady: boolean;
        private _map: OSFramework.OSMap.IMap;
        private _markerEvents: Event.Marker.MarkerEventsManager;
        private _uniqueId: string;
        private _widgetId: string;

        // protected _features: OSFramework.Feature.ExposedFeatures;
        protected _provider: W;

        constructor(map:OSFramework.OSMap.IMap, uniqueId:string, config:OSFramework.Configuration.IConfigurationMarker){
            this._map = map;
            this._uniqueId = uniqueId;
            this._config = config;
            this._isReady = false;
            this._markerEvents = new OSFramework.Event.Marker.MarkerEventsManager(
                this
            );
        }

        public get config(): Configuration.IConfigurationMarker {
            return this._config;
        }
        public get isReady(): boolean {
            return this._isReady;
        }
        public get map(): OSFramework.OSMap.IMap {
            return this._map;
        }
        public get markerEvents(): Event.Marker.MarkerEventsManager {
            return this._markerEvents;
        }
        public get uniqueId(): string {
            return this._uniqueId;
        }
        public get widgetId(): string {
            return this._widgetId;
        }
        public get provider(): W {
            return this._provider;
        }

        protected finishBuild(): void {
            this._isReady = true;

            // this.mapEvents.trigger(
            //     OSFramework.Event.OSMap.MapEventType.Initialized,
            //     this
            // );
        }
        
        applyConfigs(): void {
            throw new Error("Method not implemented.");
        }
        build(): void {
            // throw new Error("Method not implemented.");
        }
        changeProperty(propertyName: string, propertyValue: any): void {
            throw new Error("Method not implemented.");
        }
        dispose(): void {
            throw new Error("Method not implemented.");
        }
        getProviderConfig() {
            throw new Error("Method not implemented.");
        }
        refresh(): void {
            throw new Error("Method not implemented.");
        }
        equalsToID(id: string): boolean {
            throw new Error("Method not implemented.");
        }

    }
}