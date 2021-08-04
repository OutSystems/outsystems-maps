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
        private _mapType: Enum.MapType;
        private _markers: Map<string, Marker.IMarker>;
        private _markersSet: Set<Marker.IMarker>;
        private _shapes: Map<string, Shape.IShape>;
        private _shapesSet: Set<Shape.IShape>;
        private _uniqueId: string;
        private _widgetId: string;

        protected _features: Feature.ExposedFeatures;
        protected _provider: W;

        constructor(uniqueId: string, config: Z, mapType: Enum.MapType) {
            this._uniqueId = uniqueId;
            this._markers = new Map<string, Marker.IMarker>();
            this._shapes = new Map<string, Shape.IShape>();
            this._markersSet = new Set<Marker.IMarker>();
            this._shapesSet = new Set<Shape.IShape>();
            this._config = config;
            this._isReady = false;
            this._mapEvents = new Event.OSMap.MapEventsManager(this);
            this._mapType = mapType;
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

        public get shapes(): Shape.IShape[] {
            return Array.from(this._shapesSet);
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
            this._markers.set(marker.uniqueId, marker);
            this._markersSet.add(marker);

            return marker;
        }

        public addShape(shape: Shape.IShape): Shape.IShape {
            this._shapes.set(shape.uniqueId, shape);
            this._shapesSet.add(shape);

            return shape;
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
                this.mapEvents.trigger(
                    Event.OSMap.MapEventType.OnError,
                    this,
                    Enum.ErrorCodes.GEN_InvalidChangePropertyMap,
                    `${propertyName}`
                );
            }
        }

        public dispose(): void {
            this._isReady = false;
            // Let's make sure we remove both markers and shapes from the map
            this._markers.forEach(
                (marker: Marker.IMarker, markerId: string) => {
                    this.removeMarker(markerId);
                }
            );
            this._shapes.forEach((shape: Shape.IShape, shapeId: string) => {
                this.removeShape(shapeId);
            });
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

        public getShape(shape: string): Shape.IShape {
            if (this._shapes.has(shape)) {
                return this._shapes.get(shape);
            } else {
                return this.shapes.find((p) => p && p.equalsToID(shape));
            }
        }

        public hasMarker(markerId: string): boolean {
            return this._markers.has(markerId);
        }

        public hasMarkersDefined(): boolean {
            throw new Error('Method not implemented.');
        }

        public hasShape(shapeId: string): boolean {
            return this._shapes.has(shapeId);
        }

        public hasShapesDefined(): boolean {
            throw new Error('Method not implemented.');
        }

        public removeAllMarkers(): void {
            if (this._mapType === Enum.MapType.StaticMap && this.isReady) {
                this.mapEvents.trigger(
                    Event.OSMap.MapEventType.OnError,
                    this,
                    Enum.ErrorCodes.CFG_CantChangeParamsStaticMap
                );
                return;
            }
            this._markers.forEach((marker) => {
                marker.dispose();
            });

            this._markers.clear();
            this._markersSet.clear();
            if (this._isReady) {
                this.refresh();
            }
        }

        public removeAllShapes(): void {
            if (this._mapType === Enum.MapType.StaticMap && this.isReady) {
                this.mapEvents.trigger(
                    Event.OSMap.MapEventType.OnError,
                    this,
                    Enum.ErrorCodes.CFG_CantChangeParamsStaticMap
                );
                return;
            }
            this._shapes.forEach((shape) => {
                shape.dispose();
            });

            this._shapes.clear();
            this._shapesSet.clear();
            if (this._isReady) {
                this.refresh();
            }
        }

        public removeMarker(markerId: string): void {
            if (this._mapType === Enum.MapType.StaticMap && this.isReady) {
                this.mapEvents.trigger(
                    Event.OSMap.MapEventType.OnError,
                    this,
                    Enum.ErrorCodes.CFG_CantChangeParamsStaticMap
                );
                return;
            }
            if (this._markers.has(markerId)) {
                const marker = this._markers.get(markerId);

                marker.dispose();
                this._markers.delete(markerId);
                this._markersSet.delete(marker);
                // After removing a marker, we need to refresh the Map to reflect the zoom, offset and center position of the Map
                if (this._isReady) {
                    this.refresh();
                }
            }
        }

        public removeShape(shapeId: string): void {
            if (this._mapType === Enum.MapType.StaticMap && this.isReady) {
                this.mapEvents.trigger(
                    Event.OSMap.MapEventType.OnError,
                    this,
                    Enum.ErrorCodes.CFG_CantChangeParamsStaticMap
                );
                return;
            }
            if (this._shapes.has(shapeId)) {
                const shape = this._shapes.get(shapeId);

                shape.dispose();
                this._shapes.delete(shapeId);
                this._shapesSet.delete(shape);
                // After removing a marker, we need to refresh the Map to reflect the zoom, offset and center position of the Map
                if (this._isReady) {
                    this.refresh();
                }
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

        public abstract changeShapeProperty(
            shapeId: string,
            propertyName: string,
            // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
            propertyValue: any
        ): void;

        public abstract refresh(): void;
        public abstract refreshProviderEvents(): void;
    }
}
