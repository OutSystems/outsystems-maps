// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace OSFramework.Maps.SearchPlaces {
	export abstract class AbstractSearchPlaces<W, T extends Configuration.IConfigurationSearchPlaces>
		implements ISearchPlaces
	{
		/** Configuration reference */
		private _config: T;
		private _searchPlacesEvents: Event.SearchPlaces.SearchPlacesEventsManager;
		private _uniqueId: string;
		private _widgetId: string;

		protected _built: boolean;
		protected _provider: W;

		public abstract addedEvents: Array<string>;

		constructor(uniqueId: string, config: T) {
			this._uniqueId = uniqueId;
			this._config = config;
			this._built = false;
			this._searchPlacesEvents = new Event.SearchPlaces.SearchPlacesEventsManager(this);
		}

		public get config(): T {
			return this._config;
		}
		public get isReady(): boolean {
			return this._built;
		}
		public get provider(): W {
			return this._provider;
		}
		public get searchPlacesEvents(): Event.SearchPlaces.SearchPlacesEventsManager {
			return this._searchPlacesEvents;
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
				? Helper.GetElementByUniqueId(this.uniqueId).closest(Helper.Constants.searchPlacesTag).id
				: undefined;
		}

		protected finishBuild(): void {
			this._built = true;

			this.searchPlacesEvents.trigger(Event.SearchPlaces.SearchPlacesEventType.Initialized, this);
		}

		public build(): void {
			if (this._built) return;

			// Try to set the widgetId by consulting the DOM
			this._setWidgetId();
		}

		public changeProperty(propertyName: string, propertyValue: unknown): void {
			//Update SearchPlaces' config when the property is available
			if (this.config.hasOwnProperty(propertyName)) {
				this.config[propertyName] = propertyValue;
			} else {
				this.searchPlacesEvents.trigger(
					Event.SearchPlaces.SearchPlacesEventType.OnError,
					this,
					Enum.ErrorCodes.GEN_InvalidChangePropertySearchPlaces,
					undefined,
					`${propertyName}`
				);
			}
		}

		public dispose(): void {
			// The undefined value will be used to check if the Places was destroyed
			this._built = undefined;
		}

		public equalsToID(id: string): boolean {
			// using this.widgetId we make sure the widgetId gets binded if it isn't already
			return id === this._uniqueId || id === this.widgetId;
		}

		public getProviderConfig(): unknown {
			return this.config.getProviderConfig();
		}
	}
}
