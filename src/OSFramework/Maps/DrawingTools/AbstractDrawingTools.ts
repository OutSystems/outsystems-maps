// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace OSFramework.Maps.DrawingTools {
	export abstract class AbstractDrawingTools<
		W extends IDrawingToolsProvider,
		T extends Configuration.IConfigurationDrawingTools,
	> implements IDrawingTools
	{
		/** Configuration reference */
		private _config: T;
		private _map: OSMap.IMap;
		private _tools: Map<string, ITool>;
		private _toolsSet: Set<ITool>;
		private readonly _uniqueId: string;
		private _widgetId: string;

		protected _built: boolean;
		protected _createElements: Array<unknown>;
		protected _drawingToolsEvents: Event.DrawingTools.DrawingToolsEventsManager;
		protected _provider: W;

		constructor(map: OSMap.IMap, uniqueId: string, config: T) {
			this._map = map;
			this._uniqueId = uniqueId;
			this._config = config;
			this._built = false;
			this._drawingToolsEvents = new Event.DrawingTools.DrawingToolsEventsManager(this);
			this._tools = new Map<string, ITool>();
			this._toolsSet = new Set<ITool>();
			this._createElements = [];
		}

		public get config(): T {
			return this._config;
		}
		public get createdElements(): Array<unknown> {
			return this._createElements;
		}
		public get drawingToolsEvents(): Event.DrawingTools.DrawingToolsEventsManager {
			return this._drawingToolsEvents;
		}
		public get isReady(): boolean {
			return this._built;
		}
		public get map(): OSMap.IMap {
			return this._map;
		}
		public get provider(): W {
			return this._provider;
		}
		public get tools(): ITool[] {
			return Array.from(this._toolsSet);
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
				? Helper.GetElementByUniqueId(this.uniqueId).closest(Helper.Constants.drawingToolsTag).id
				: undefined;
		}

		protected finishBuild(): void {
			this._built = true;

			this.drawingToolsEvents.trigger(Event.DrawingTools.DrawingToolsEventType.Initialized);
		}

		public addTool(tool: ITool): ITool {
			this._tools.set(tool.uniqueId, tool);
			this._toolsSet.add(tool);

			return tool;
		}

		public build(): void {
			if (this._built) return;

			// Try to set the widgetId by consulting the DOM
			this._setWidgetId();
		}

		public changeProperty(propertyName: string, propertyValue: unknown): void {
			//Update Shape's config when the property is available
			if (this.config.hasOwnProperty(propertyName)) {
				this.config[propertyName] = propertyValue;
			} else {
				this.map.mapEvents.trigger(
					Event.OSMap.MapEventType.OnError,
					this.map,
					Enum.ErrorCodes.GEN_InvalidChangePropertyDrawingTools,
					`${propertyName}`
				);
			}
		}

		public changeToolProperty(toolId: string, propertyName: string, propertyValue: unknown): void {
			const tool = this._tools.get(toolId);
			tool.changeProperty(propertyName, propertyValue);
		}

		public dispose(): void {
			this._built = false;
			this.removeAllTools();
			this._map = undefined;
			this._config = undefined;
			this._tools = undefined;
			this._toolsSet = undefined;
		}

		public equalsToID(id: string): boolean {
			// using this.widgetId we make sure the widgetId gets binded if it isn't already
			return id === this._uniqueId || id === this.widgetId;
		}

		public getProviderConfig(): Configuration.IConfigurationDrawingTools {
			return this._config.getProviderConfig() as Configuration.IConfigurationDrawingTools;
		}

		public hasTool(toolId: string): boolean {
			return this._tools.has(toolId);
		}

		public removeAllTools(): void {
			this._tools.forEach((tool) => {
				tool.dispose();
			});

			this._tools.clear();
			this._toolsSet.clear();
		}

		public removeTool(toolId: string): void {
			if (this.hasTool(toolId)) {
				const tool = this._tools.get(toolId);

				tool.dispose();
				this._tools.delete(toolId);
				this._toolsSet.delete(tool);
			}
		}

		public toolAlreadyExists(toolType: Enum.DrawingToolsTypes): boolean {
			return Array.from(this._tools.values()).some((tool) => tool.type === toolType);
		}

		public validateProviderEvent(eventName: string): boolean {
			return this.providerEvents.indexOf(eventName) !== -1;
		}

		public abstract get providerEvents(): Array<string>;

		public abstract refreshProviderEvents(): void;
	}
}
