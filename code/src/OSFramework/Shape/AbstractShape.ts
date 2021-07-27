// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace OSFramework.Shape {
    export abstract class AbstractShape<
        W,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        Z extends Configuration.IConfigurationShape
    > implements IShapeGeneric<W> {
        /** Configuration reference */
        private _config: Configuration.IConfigurationShape;
        private _index: number;
        private _map: OSMap.IMap;
        private _uniqueId: string;
        private _widgetId: string;

        protected _built: boolean;
        protected _provider: W;
        protected _shapeEvents: Event.Shape.ShapeEventsManager;

        abstract hasEvents: boolean;

        constructor(
            map: OSMap.IMap,
            uniqueId: string,
            type: Enum.ShapeType,
            config: Configuration.IConfigurationShape
        ) {
            this._map = map;
            this._uniqueId = uniqueId;
            this._config = config;
            this._built = false;
            this._shapeEvents = new Event.Shape.ShapeEventsManager(this);
        }
        public abstract get shapeTag(): string;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        public abstract get providerEvents(): any;

        public get config(): Configuration.IConfigurationShape {
            return this._config;
        }
        public get index(): number {
            return this._map.shapes.findIndex(
                (shape) => shape.uniqueId === this.uniqueId
            );
        }
        public get isReady(): boolean {
            return this._built;
        }
        public get map(): OSMap.IMap {
            return this._map;
        }
        public get shapeEvents(): Event.Shape.ShapeEventsManager {
            return this._shapeEvents;
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

            this.shapeEvents.trigger(Event.Shape.ShapeEventType.Initialized);
        }

        public build(): void {
            if (this._built) return;
            // Remove in  the future (undefined part) as the Shapes might be created via the parameter Shapes_DEPRECATED.
            // We only have the widgetId when the shape is created via Shape Block.
            this._widgetId = Helper.GetElementByUniqueId(this.uniqueId, false)
                ? Helper.GetElementByUniqueId(this.uniqueId).closest(
                      this.shapeTag
                  ).id
                : undefined;
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
        public changeProperty(propertyName: string, propertyValue: any): void {
            //Update Shape's config when the property is available
            if (this.config.hasOwnProperty(propertyName)) {
                this.config[propertyName] = propertyValue;
            } else {
                this.map.mapEvents.trigger(
                    Event.OSMap.MapEventType.OnError,
                    this.map,
                    Enum.ErrorCodes.GEN_InvalidChangePropertyMarker,
                    `${propertyName}`
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
