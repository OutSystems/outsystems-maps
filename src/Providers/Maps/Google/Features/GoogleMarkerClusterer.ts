// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace Provider.Maps.Google.Feature {
	// eslint-disable-next-line @typescript-eslint/no-var-requires
	export class GoogleMarkerClusterer
		implements
			OSFramework.Maps.Feature.IMarkerClusterer,
			OSFramework.Maps.Interface.IBuilder,
			OSFramework.Maps.Interface.IDisposable
	{
		private _algorithm: GoogleMapsAlgorithm;
		private _config: Configuration.MarkerClusterer.MarkerClustererConfig;
		private _map: OSMap.IMapGoogle;
		private _markerClusterer: GoogleMapsMarkerClusterer;
		private _renderer: GoogleMapsClusterRenderer;
		private _repaintOnTilesLoaded: google.maps.MapsEventListener;

		constructor(
			map: OSMap.IMapGoogle,
			markerClustererConfigs: Configuration.MarkerClusterer.MarkerClustererConfig
		) {
			this._map = map;
			// Set the clusterer configs
			this._config = new Configuration.MarkerClusterer.MarkerClustererConfig(markerClustererConfigs);
		}

		public get markerClusterer(): GoogleMapsMarkerClusterer {
			return this._markerClusterer;
		}

		public get isEnabled(): boolean {
			return this._config.markerClustererActive && this._markerClusterer !== undefined;
		}

		private _makeAlgorithm(): void {
			this._algorithm = new window.markerClusterer.SuperClusterAlgorithm({
				maxZoom: this._config.markerClustererMaxZoom,
				minPoints: this._config.markerClustererMinClusterSize,
			});
		}

		private _makeConfigs(): GoogleMapsMarkerClustererOptions {
			const pConfigs = this._config.getProviderConfig();
			if (this._config.markerClustererActive) {
				pConfigs.algorithm = this._algorithm;
				pConfigs.algorithmOptions = undefined;
				pConfigs.map = this._map.provider;
				pConfigs.markers = this._map.markersReady as GoogleMapsMarker[];
				pConfigs.onClusterClick = this._zoomClickHandler.bind(this);
				pConfigs.renderer = this._makeRenderer();
			}

			return pConfigs;
		}

		private _makeRenderer(): GoogleMapsClusterRenderer {
			if (this._renderer === undefined) {
				this._renderer = new window.markerClusterer.DefaultRenderer();
			}
			return this._renderer;
		}

		private _rebuildClusters(): void {
			this._markerClusterer.clearMarkers();
			this._markerClusterer = undefined;
			this._markerClusterer = new window.markerClusterer.MarkerClusterer(this._makeConfigs());
		}

		private _setState(): void {
			if (this._config.markerClustererActive) {
				this._rebuildClusters();
			} else {
				this._markerClusterer.clearMarkers();
				this._map.markers.forEach((marker) => {
					const provider = marker.provider as GoogleMapsMarker;

					if (Helper.TypeChecker.IsAdvancedMarker(provider)) {
						(provider as google.maps.marker.AdvancedMarkerElement).map = this._map.provider;
					} else {
						(provider as google.maps.Marker).setMap(this._map.provider);
					}
				});
			}
		}

		private _zoomClickHandler(
			event: google.maps.MapMouseEvent,
			cluster: GoogleMapsCluster,
			map: google.maps.Map
		): void {
			if (this._config.markerClustererZoomOnClick) {
				map.fitBounds(cluster.bounds);
			}
		}

		public addMarker(marker: OSFramework.Maps.Marker.IMarker): void {
			if (this.isEnabled && marker.isReady) {
				// We need to make sure that a redraw is triggered whenever a new marker is added to the clusters
				this._markerClusterer.addMarker(marker.provider as GoogleMapsMarker, false);
			}
		}

		public build(): void {
			this._makeRenderer();
			this._makeAlgorithm();
			this._markerClusterer = new window.markerClusterer.MarkerClusterer(this._makeConfigs());

			// Make sure to repaint the whole clusters as soon as map tiles get loaded
			this._repaintOnTilesLoaded = google.maps.event.addListenerOnce(
				this._map.provider,
				'tilesloaded',
				this.repaint.bind(this)
			);
		}

		public changeProperty(propertyName: string, propertyValue: unknown): void {
			const propValue = OSFramework.Maps.Enum.OS_Config_MarkerClusterer[propertyName];
			if (this._config.hasOwnProperty(propertyName)) {
				this._config[propertyName] = propertyValue;
			} else {
				this._map.mapEvents.trigger(
					OSFramework.Maps.Event.OSMap.MapEventType.OnError,
					this._map,
					OSFramework.Maps.Enum.ErrorCodes.GEN_InvalidChangePropertyMarkerClusterer,
					`${propertyName}`
				);
			}

			// If the clusterer already exists, change its provider configs
			if (this.markerClusterer !== undefined) {
				switch (propValue) {
					case OSFramework.Maps.Enum.OS_Config_MarkerClusterer.markerClustererActive:
						this._setState();
						break;
					case OSFramework.Maps.Enum.OS_Config_MarkerClusterer.markerClustererMinClusterSize:
					case OSFramework.Maps.Enum.OS_Config_MarkerClusterer.markerClustererMaxZoom:
						this._makeAlgorithm();
						this._rebuildClusters();
						break;
					case OSFramework.Maps.Enum.OS_Config_MarkerClusterer.markerClustererZoomOnClick:
						return;
				}
				this.repaint();
			}
		}

		public dispose(): void {
			this._markerClusterer = undefined;
			// Remove the listeners associated to the cluster from a map provider
			google.maps.event.removeListener(this._repaintOnTilesLoaded);
		}

		public removeMarker(marker: OSFramework.Maps.Marker.IMarker): void {
			if (this.isEnabled && marker.isReady) {
				// We need to make sure that a redraw is triggered whenever a new marker is removed from the clusters
				this._markerClusterer?.removeMarker(marker.provider as GoogleMapsMarker, false);
			}
		}

		public repaint(): void {
			this._markerClusterer.render();
		}

		public setClusterRenderer(renderer: OSFramework.Maps.Feature.IMarkerClustererRender) {
			this._renderer = renderer as GoogleMapsClusterRenderer;
			if (this.isEnabled) {
				this._rebuildClusters();
			}
		}
	}
}
