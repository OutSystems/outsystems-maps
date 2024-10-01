// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace OSFramework.Maps.Marker {
	export abstract class AbstractMarker<W, Z extends Configuration.IConfigurationMarker> implements IMarkerGeneric<W> {
		/** Configuration reference */
		private _config: Z;
		private _map: OSMap.IMap;
		private _uniqueId: string;
		private _widgetId: string;

		protected _built: boolean;
		protected _destroyed: boolean;
		protected _markerEvents: Event.Marker.MarkerEventsManager;
		protected _provider: W;

		protected abstract hasEvents: boolean;

		constructor(map: OSMap.IMap, uniqueId: string, type: Enum.MarkerType, config: Z) {
			this._map = map;
			this._uniqueId = uniqueId;
			this._config = config;
			this._built = false;
			this._destroyed = false;
			this._markerEvents = new Event.Marker.MarkerEventsManager(this);
		}
		public abstract get markerTag(): string;

		public get config(): Z {
			return this._config;
		}
		public get hasPopup(): boolean {
			return false;
		}
		public get index(): number {
			return this._map.markers.findIndex((marker) => marker.uniqueId === this.uniqueId);
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
			this.markerEvents.trigger(Event.Marker.MarkerEventType.Initialized);

			// If the marker is ready (has the provider defined) we need to add it into the marker cluster.
			// The validation to guarantee that the clusterer is activated for the map is being done inside the addMarker method from markerClusterer feature.
			this._map.hasMarkerClusterer() && this._map.features.markerClusterer.addMarker(this);
		}

		public build(): void {
			if (this._built) return;
			// Remove in  the future (undefined part) as the Markers might be created via the parameter Markers_DEPRECATED.
			// We only have the widgetId when the marker is created via Marker Block.
			this._widgetId = Helper.GetElementByUniqueId(this.uniqueId, false)
				? Helper.GetElementByUniqueId(this.uniqueId).closest(this.markerTag).id
				: undefined;
		}

		public changeProperty(propertyName: string, propertyValue: unknown): void {
			//Update Marker's config when the property is available
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
			this._destroyed = true;
		}

		public equalsToID(id: string): boolean {
			return id === this._uniqueId || id === this._widgetId;
		}

		public getPosition(): OSFramework.Maps.OSStructures.OSMap.ICoordenates {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const provider = this._provider as any;
			let position = provider.getPosition ? provider._getPosition() : undefined;
			if (position === undefined) {
				position = provider.position;
			}
			return position as OSFramework.Maps.OSStructures.OSMap.ICoordenates;
		}

		public getProviderConfig(): unknown {
			return this.config.getProviderConfig();
		}

		public abstract refreshProviderEvents(): void;
		public abstract validateProviderEvent(eventName: string): boolean;
	}
}
