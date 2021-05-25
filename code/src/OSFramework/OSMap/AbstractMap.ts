// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace OSFramework.OSMap {
    export abstract class AbstractMap<
        W,
        Z extends Configuration.IConfigurationMap
    > implements IMapGeneric<W> {
        /** Configuration reference */
        private _config: Z;
        private _isReady: boolean;
        private _mapEvents: Event.OSMap.MapEventsManager;
        private _markers: Map<string, Marker.IMarker>;
        private _markersSet: Set<Marker.IMarker>;
        private _uniqueId: string;
        private _widgetId: string;

        protected _features: Feature.ExposedFeatures;
        protected _provider: W;

        constructor(uniqueId: string, config: Z) {
            this._uniqueId = uniqueId;
            this._markers = new Map<string, Marker.IMarker>();
            this._markersSet = new Set<Marker.IMarker>();
            this._config = config;
            this._isReady = false;
            this._mapEvents = new Event.OSMap.MapEventsManager(this);
        }
        public abstract get mapTag(): string;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        public abstract get providerEvents(): any;

        public get config(): Z {
            return this._config;
        }

        public get features(): Feature.ExposedFeatures {
            return this._features;
        }

        public get isReady(): boolean {
            return this._isReady;
        }

        public get markers(): Marker.IMarker[] {
            return Array.from(this._markersSet);
        }

        public get mapEvents(): Event.OSMap.MapEventsManager {
            return this._mapEvents;
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
            this._isReady = true;

            this.mapEvents.trigger(Event.OSMap.MapEventType.Initialized, this);
        }

        public addMarker(marker: Marker.IMarker): Marker.IMarker {
            console.log(`Add Marker '${marker.uniqueId}'`);
            this._markers.set(marker.uniqueId, marker);
            this._markersSet.add(marker);

            return marker;
        }

        public build(): void {
            this._widgetId = Helper.GetElementByUniqueId(this.uniqueId).closest(
                this.mapTag
            ).id;
        }

        // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
        public changeProperty(propertyName: string, propertyValue: any): void {
            //Update Map's config when the property is available
            if (this.config.hasOwnProperty(propertyName)) {
                this.config[propertyName] = propertyValue;
            } else {
                throw new Error(
                    `changeProperty - Property '${propertyName}' can't be changed.`
                );
            }
        }

        public dispose(): void {
            this._isReady = false;
            this._markers.forEach(
                (marker: Marker.IMarker, markerId: string) => {
                    this.removeMarker(markerId);
                }
            );
        }

        public equalsToID(mapId: string): boolean {
            return mapId === this._uniqueId || mapId === this._widgetId;
        }

        public getMarker(markerId: string): Marker.IMarker {
            if (this._markers.has(markerId)) {
                return this._markers.get(markerId);
            } else {
                return this.markers.find((p) => p && p.equalsToID(markerId));
            }
        }

        public hasMarker(markerId: string): boolean {
            return this._markers.has(markerId);
        }

        public hasMarkersDefined(): boolean {
            throw new Error('Method not implemented.');
        }

        public removeAllMarkers(): void {
            this._markers.forEach((marker) => {
                marker.dispose();
            });

            this._markers.clear();
            this._markersSet.clear();
        }

        public removeMarker(markedId: string): void {
            if (this._markers.has(markedId)) {
                const marker = this._markers.get(markedId);

                marker.dispose();
                this._markers.delete(markedId);
                this._markersSet.delete(marker);
                // After removing a marker, we need to refresh the Map to reflect the zoom, offset and center position of the Map
                this.refresh();

                console.log(`Remove Marker '${markedId}'`);
            } else {
                console.error(
                    `removeMarker - Marker id:${markedId} doesn't exist`
                );
            }
        }

        public validateProviderEvent(eventName: string): boolean {
            return this.providerEvents.indexOf(eventName) !== -1;
        }

        public abstract changeMarkerProperty(
            markerId: string,
            propertyName: string,
            // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
            propertyValue: any
        ): void;

        public abstract refresh(): void;
        public abstract refreshProviderEvents(): void;
    }
}
