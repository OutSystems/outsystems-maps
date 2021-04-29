namespace OSFramework.OSMap {
    export abstract class AbstractMap<
        W,
        Z extends Configuration.IConfigurationMap
    > implements IMapGeneric<W> {
        private _config: Configuration.IConfigurationMap;
        private _isReady: boolean;
        private _mapEvents: Event.OSMap.MapEventsManager;
        private _markers: Map<string, OSFramework.Marker.IMarker>;
        private _markersSet: Set<OSFramework.Marker.IMarker>;
        private _uniqueId: string;
        private _widgetId: string;

        protected _provider: W;

        constructor(uniqueId: string, config: OSFramework.Configuration.IConfigurationMap){
            this._uniqueId = uniqueId;
            this._markers = new Map<string, OSFramework.Marker.IMarker>();
            this._markersSet = new Set<OSFramework.Marker.IMarker>();
            this._config = config;
            this._isReady = false;
            this._mapEvents = new OSFramework.Event.OSMap.MapEventsManager(
                this
            );
        }

        public get config(): Configuration.IConfigurationMap {
            return this._config;
        }
        public get isReady(): boolean {
            return this._isReady;
        }
        public get mapEvents(): Event.OSMap.MapEventsManager {
            return this._mapEvents;
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
        }

        addMarker(marker: OSFramework.Marker.IMarker): OSFramework.Marker.IMarker {
            throw new Error("Method not implemented.");
        }
        changeMarkerProperty(markerId: string, propertyName: string, propertyValue: any): void {
            throw new Error("Method not implemented.");
        }
        changeProperty(propertyName: string, propertyValue: any): void {
            throw new Error("Method not implemented.");
        }
        getMarker(markerId: string): OSFramework.Marker.IMarker {
            throw new Error("Method not implemented.");
        }
        getMarkers(): OSFramework.Marker.IMarker[] {
            throw new Error("Method not implemented.");
        }
        hasMarker(markerId: string): boolean {
            throw new Error("Method not implemented.");
        }
        hasMarkersDefined(): boolean {
            throw new Error("Method not implemented.");
        }
        removeMarker(markedId: string): void {
            throw new Error("Method not implemented.");
        }
        build(): void {
            throw new Error("Method not implemented.");
        }
        dispose(): void {
            throw new Error("Method not implemented.");
        }

    }
}