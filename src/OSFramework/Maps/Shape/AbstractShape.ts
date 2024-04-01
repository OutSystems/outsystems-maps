// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace OSFramework.Maps.Shape {
	export abstract class AbstractShape<W, T extends Configuration.IConfigurationShape> implements IShape {
		/** Configuration reference */
		private _config: T;
		private _map: OSMap.IMap;
		private _type: Enum.ShapeType;
		private _uniqueId: string;
		private _widgetId: string;

		protected _addedEvents: Array<string>;
		protected _built: boolean;
		protected _provider: W;
		protected _shapeEvents: Event.Shape.ShapeEventsManager;

		protected abstract hasEvents: boolean;

		constructor(map: OSMap.IMap, uniqueId: string, type: Enum.ShapeType, config: T) {
			this._map = map;
			this._uniqueId = uniqueId;
			this._config = config;
			this._built = false;
			this._shapeEvents = new Event.Shape.ShapeEventsManager(this);
			this._type = type;
			this._addedEvents = [];
		}

		public get config(): T {
			return this._config;
		}
		public get isReady(): boolean {
			return this._built;
		}
		public get map(): OSMap.IMap {
			return this._map;
		}
		/** Gets the minimum mandatory number of addresses/coordinates to create the path (depends on the shape) */
		public get minPath(): number {
			return Enum.ShapeMinPath[this._type];
		}
		public get provider(): W {
			return this._provider;
		}
		public get shapeEvents(): Event.Shape.ShapeEventsManager {
			return this._shapeEvents;
		}
		public get type(): Enum.ShapeType {
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
				? Helper.GetElementByUniqueId(this.uniqueId).closest(this.shapeTag).id
				: undefined;
		}

		protected finishBuild(): void {
			this._built = true;

			this.shapeEvents.trigger(Event.Shape.ShapeEventType.Initialized);
		}

		protected triggerShapeChangedEvent(): void {
			const shapeLocation = this.getShapeCoordinates();

			this.shapeEvents.trigger(
				// EventType
				Maps.Event.Shape.ShapeEventType.ProviderEvent,
				// EventName
				Maps.Helper.Constants.shapeChangedEvent,
				shapeLocation
			);
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
					Enum.ErrorCodes.GEN_InvalidChangePropertyShape,
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

		public getProviderConfig(): unknown {
			return this.config.getProviderConfig();
		}

		public validateProviderEvent(eventName: string): boolean {
			return this.shapeProviderEvents.indexOf(eventName) !== -1;
		}

		protected abstract get invalidShapeLocationErrorCode(): Enum.ErrorCodes;

		protected abstract getShapeCoordinates(): Maps.OSStructures.OSMap.OSShapeCoordinates;
		public abstract refreshProviderEvents(): void;
		public abstract get providerBounds(): unknown;
		public abstract get shapeProviderEvents(): Array<string>;
		public abstract get shapeTag(): string;
	}
}
