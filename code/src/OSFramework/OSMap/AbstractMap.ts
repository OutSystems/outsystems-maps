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

        protected _features: OSFramework.Feature.ExposedFeatures;
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
        public get features(): OSFramework.Feature.ExposedFeatures {
            return this._features;
        }

        protected finishBuild(): void {
            this._isReady = true;

            // this.mapEvents.trigger(
            //     OSFramework.Event.OSMap.MapEventType.Initialized,
            //     this
            // );
        }

        addMarker(marker: OSFramework.Marker.IMarker): OSFramework.Marker.IMarker {
            // console.log(`Add Marker '${marker.uniqueId}'`);
            this._markers.set(marker.uniqueId, marker);
            this._markersSet.add(marker);

            return marker;
        }
        build(): void {
            // this._widgetId = OSFramework.Helper.GetElementByUniqueId(
            //     this.uniqueId
            // ).closest(OSFramework.Helper.Constants.gridTag).id;
        }
        changeMarkerProperty(markerId: string, propertyName: string, propertyValue: any): void {
            throw new Error("Method not implemented.");
        }
        changeProperty(propertyName: string, propertyValue: any): void {
            throw new Error("Method not implemented.");
        }
        dispose(): void {
            this._isReady = false;
            this._markers.forEach(
                (marker: OSFramework.Marker.IMarker, markerId: string) => {
                    this.removeMarker(markerId);
                }
            );
        }
        equalsToID(mapId: string): boolean {
            return mapId === this._uniqueId || mapId === this._widgetId;
        }
        getMarker(markerId: string): OSFramework.Marker.IMarker {
            if (this._markers.has(markerId)) {
                return this._markers.get(markerId);
            } else {
                return this.getMarkers().find((p) => p && p.equalsToID(markerId));
            }
        }
        getMarkers(): OSFramework.Marker.IMarker[] {
            return Array.from(this._markersSet);
        }
        hasMarker(markerId: string): boolean {
            return this._markers.has(markerId);
        }
        hasMarkersDefined(): boolean {
            throw new Error("Method not implemented.");
        }
        removeAllMarkers(): void {
            this._markers.clear();
            this._markersSet.clear();
        }
        removeMarker(markedId: string): void {
            if (this._markers.has(markedId)) {
                const marker = this._markers.get(markedId);

                marker.dispose();
                this._markers.delete(markedId);
                this._markersSet.delete(marker);

                console.log(
                    `Remove Marker '${markedId}'`
                );
            } else {
                console.error(
                    `removeMarker - Marker id:${markedId} doesn't exist`
                );
            }
        }

    }
}