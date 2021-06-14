// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace OSFramework.Marker {
    export abstract class AbstractMarker<
        W,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        Z extends Configuration.IConfigurationMarker
    > implements IMarkerGeneric<W> {
        /** Configuration reference */
        private _config: Configuration.IConfigurationMarker;
        private _index: number;
        private _map: OSMap.IMap;
        private _uniqueId: string;
        private _widgetId: string;

        protected _built: boolean;
        protected _markerEvents: Event.Marker.MarkerEventsManager;
        protected _provider: W;

        abstract hasEvents: boolean;

        constructor(
            map: OSMap.IMap,
            uniqueId: string,
            type: Enum.MarkerType,
            config: Configuration.IConfigurationMarker
        ) {
            this._map = map;
            this._uniqueId = uniqueId;
            this._config = config;
            this._built = false;
            this._markerEvents = new Event.Marker.MarkerEventsManager(this);
        }
        public abstract get markerTag(): string;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        public abstract get providerEvents(): any;

        public get config(): Configuration.IConfigurationMarker {
            return this._config;
        }
        public get hasPopup(): boolean {
            return false;
        }
        public get index(): number {
            return this._map.markers.findIndex(
                (marker) => marker.uniqueId === this.uniqueId
            );
        }
        public get isReady(): boolean {
            return this._built;
        }
        public get map(): OSMap.IMap {
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

        protected finishBuild(): void {
            this._built = true;
        }

        public build(): void {
            if (this._built) return;
            // Remove in  the future (undefined part) as the Markers might be created via the parameter Markers_DEPRECATED.
            // We only have the widgetId when the marker is created via Marker Block.
            this._widgetId = Helper.GetElementByUniqueId(this.uniqueId, false)
                ? Helper.GetElementByUniqueId(this.uniqueId).closest(
                      this.markerTag
                  ).id
                : undefined;
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
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

        public equalsToID(id: string): boolean {
            return id === this._uniqueId || id === this._widgetId;
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        public getProviderConfig(): any {
            return this._config.getProviderConfig();
        }

        public validateProviderEvent(eventName: string): boolean {
            return this.providerEvents.indexOf(eventName) !== -1;
        }

        public abstract refreshProviderEvents(): void;
    }
}
