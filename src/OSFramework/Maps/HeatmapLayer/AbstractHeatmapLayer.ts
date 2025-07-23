// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace OSFramework.Maps.HeatmapLayer {
	export abstract class AbstractHeatmapLayer<
		W,
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		T extends Configuration.IConfigurationHeatmapLayer,
	> implements IHeatmapLayer
	{
		/** Configuration reference */
		private _config: T;
		private _map: OSMap.IMap;
		private readonly _uniqueId: string;
		private _widgetId: string;

		protected _built: boolean;
		protected _provider: W;

		constructor(map: OSMap.IMap, uniqueId: string, config: T) {
			this._map = map;
			this._uniqueId = uniqueId;
			this._config = config;
			this._built = false;
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
		public get provider(): W {
			return this._provider;
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
				? Helper.GetElementByUniqueId(this.uniqueId).closest(Helper.Constants.heatmapLayerTag).id
				: undefined;
		}

		protected finishBuild(): void {
			this._built = true;
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
					Enum.ErrorCodes.GEN_InvalidChangePropertyHeatmapLayer,
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

		public getProviderConfig(): Configuration.IConfigurationHeatmapLayer {
			return this._config.getProviderConfig() as Configuration.IConfigurationHeatmapLayer;
		}
	}
}
