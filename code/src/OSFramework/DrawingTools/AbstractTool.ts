// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace OSFramework.DrawingTools {
    export abstract class AbstractTool<
        T extends Configuration.IConfigurationTool
    > implements ITool {
        /** Configuration reference */
        private _config: T;
        private _drawingTools: IDrawingTools;
        private _map: OSMap.IMap;
        private _type: string;
        private _uniqueId: string;
        private _widgetId: string;

        protected _built: boolean;

        constructor(
            map: OSMap.IMap,
            drawingTools: IDrawingTools,
            uniqueId: string,
            type: string,
            config: T
        ) {
            this._map = map;
            this._drawingTools = drawingTools;
            this._uniqueId = uniqueId;
            this._config = config;
            this._built = false;
            this._type = type;
        }

        public get config(): T {
            return this._config;
        }
        public get drawingTools(): IDrawingTools {
            return this._drawingTools;
        }
        public get isReady(): boolean {
            return this._built;
        }
        public get map(): OSMap.IMap {
            return this._map;
        }
        public get type(): string {
            return this._type;
        }
        public get uniqueId(): string {
            return this._uniqueId;
        }
        public get widgetId(): string {
            // If widgetId is undefined try to get its value from the DOM again
            if (this._widgetId === undefined || this._widgetId === '') {
                this._setWidgetId();
            }
            return this._widgetId;
        }

        private _setWidgetId(): void {
            this._widgetId = Helper.GetElementByUniqueId(this.uniqueId, false)
                ? Helper.GetElementByUniqueId(this.uniqueId).closest(
                      Helper.Constants.drawingToolsTag
                  ).id
                : undefined;
        }

        protected finishBuild(): void {
            this._built = true;

            // this.shapeEvents.trigger(Event.Shape.ShapeEventType.Initialized);
        }

        public build(): void {
            if (this._built) return;

            // Try to set the widgetId by consulting the DOM
            this._setWidgetId();
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
                    Enum.ErrorCodes.GEN_InvalidChangePropertyTools,
                    `${propertyName}`
                );
            }
        }

        public dispose(): void {
            this._built = false;
        }

        public equalsToID(id: string): boolean {
            // using this.widgetId we make sure the widgetId gets binded if it isn't already
            return id === this._uniqueId || id === this.widgetId;
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        public getProviderConfig(): T {
            return this._config.getProviderConfig();
        }

        public abstract addCompletedEvent(): void;
    }
}