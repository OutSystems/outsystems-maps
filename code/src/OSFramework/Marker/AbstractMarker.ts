namespace OSFramework.Marker {
    export abstract class AbstractMarker<
        W,
        Z extends Configuration.IConfigurationMarker
    > implements IMarkerGeneric<W> {
        /** Configuration reference */
        private _config: Configuration.IConfigurationMarker;
        private _map: OSFramework.OSMap.IMap;
        private _uniqueId: string;
        private _widgetId: string;
        
        protected _built: boolean;
        protected _markerEvents: Event.Marker.MarkerEventsManager;
        protected _provider: W;

        abstract hasEvents: boolean;

        constructor(map:OSFramework.OSMap.IMap, uniqueId:string, config:OSFramework.Configuration.IConfigurationMarker){
            this._map = map;
            this._uniqueId = uniqueId;
            this._config = config;
            this._built = false;
            this._markerEvents = new OSFramework.Event.Marker.MarkerEventsManager(
                this
            );
        }

        public get config(): Configuration.IConfigurationMarker {
            return this._config;
        }
        public get isReady(): boolean {
            return this._built;
        }
        public get map(): OSFramework.OSMap.IMap {
            return this._map;
        }
        public get markerEvents(): Event.Marker.MarkerEventsManager {
            return this._markerEvents;
        }
        public get provider(): W {
            return this._provider;
        }
        public get uniqueId(): string {
            return this._uniqueId;
        }
        public get widgetId(): string {
            return this._widgetId;
        }

        public build(): void {
            if (this._built) return;
            this._built = true;

            // this._preBuild();
        }
        public changeProperty(propertyName: string, propertyValue: any): void {
            //Update Marker's config when the property is available
            if (this.config.hasOwnProperty(propertyName)) {
                this.config[propertyName] = propertyValue;
            } else {
                throw new Error(
                    `changeProperty - Property '${propertyName}' can't be changed.`
                );
            }
        }
        public dispose(): void {
            this._built = false;
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        public getProviderConfig(): any {
            return this._config.getProviderConfig();
        }

        public equalsToID(id: string): boolean {
            return (
                id === this._uniqueId ||
                id === this._widgetId
            );
        }
    }
}