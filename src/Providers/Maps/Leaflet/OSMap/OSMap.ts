/// <reference path="../../../../OSFramework/Maps/OSMap/AbstractMap.ts" />

// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace Provider.Maps.Leaflet.OSMap {
	export class Map
		extends OSFramework.Maps.OSMap.AbstractMap<L.Map, Configuration.OSMap.LeafletMapConfig>
		implements IMapLeaflet
	{
		private _addedEvents: Array<string>;
		private _fBuilder: Feature.FeatureBuilder;
		private _openStreetMapLayer: L.TileLayer;

		constructor(mapId: string, configs: JSON) {
			super(
				mapId,
				OSFramework.Maps.Enum.ProviderType.Leaflet,
				new Configuration.OSMap.LeafletMapConfig(configs),
				OSFramework.Maps.Enum.MapType.Map
			);
			this._addedEvents = [];
			// Set the openStreetMapLayer with the URL and the attribution needed
			this._openStreetMapLayer = new L.TileLayer(Constants.openStreetMapTileLayer.url, {
				attribution: Constants.openStreetMapTileLayer.attribution,
			});
		}

		private _addMapZoomHandler(): void {
			this._provider.on(Constants.OSMap.ProviderEventNames.zoom_end, this._mapZoomChangeCallback);
		}

		//Used to prevent page from scrolling when user puts Leaflet map on focus
		//Leaflet calls focus() on a 'mousedown' listener making the page to scroll, this event is called before Leaflet event preventing the scroll.
		// https://github.com/Leaflet/Leaflet/blob/b2daaeeb43dac8367a6d3800b69f29d7b6c128e0/src/map/handler/Map.Keyboard.js#L89C1-L89C32
		private _addOnMouseDownHandler(): void {
			this._provider.on(
				Constants.OSMap.ProviderEventNames.mousedown,
				() => {
					this.provider.getContainer().focus({ preventScroll: true });
				},
				{ capture: true }
			);
		}

		private _addZoomButtons(): void {
			// Adds the zoom buttons to the map but with custom logic
			new ZoomButtons.ZoomButtons({ position: 'topleft' }).addTo(this.provider);
		}

		private _buildDrawingTools(): void {
			// Here we aren't using a forEach because there is only one drawingTools per map
			this.drawingTools && this.drawingTools.build();
		}

		private _buildMarkers(): void {
			this.markers.forEach((marker) => marker.build());
		}

		private _buildShapes(): void {
			this.shapes.forEach((shape) => shape.build());
		}

		private _getProviderConfig(): L.MapOptions {
			// Make sure the center has a default value before the conversion of the location to coordinates
			this.config.center = OSFramework.Maps.Helper.Constants.defaultMapCenter;

			return this.config.getProviderConfig();
		}

		private _removeMapZoomHandler(): void {
			this._provider.off(Constants.OSMap.ProviderEventNames.zoom_end, this._mapZoomChangeCallback);
		}

		private _setMapEvents(): void {
			// Any events that got added to the mapEvents via the API Subscribe method will have to be taken care here
			// If the Event type of each handler is MapProviderEvent, we want to make sure to add that event to the listeners of the Google Maps provider (e.g. click, dblclick, contextmenu, etc)
			// Otherwise, we don't want to add them to the google provider listeners (e.g. OnInitialize, OnError, OnTriggeredEvent)
			this.mapEvents.handlers.forEach(
				(handler: OSFramework.Maps.Event.IEvent<OSFramework.Maps.OSMap.IMap>, eventName) => {
					if (handler instanceof OSFramework.Maps.Event.OSMap.MapProviderEvent) {
						this._addedEvents.push(eventName);
						this._provider.addEventListener(
							// Get the correct eventName for leaflet provider
							// Name of the event (e.g. click, dblclick, contextmenu, etc)
							Constants.OSMap.ProviderEventNames[eventName],
							// Callback CAN have an attribute (e) which is of the type MapMouseEvent
							// Trigger the event by specifying the ProviderEvent MapType and the coords (lat, lng) if the callback has the attribute MapMouseEvent
							(e?: L.LeafletMouseEvent) => {
								this.mapEvents.trigger(
									OSFramework.Maps.Event.OSMap.MapEventType.ProviderEvent,
									this,
									eventName,
									e && e.latlng !== undefined
										? JSON.stringify({
												Lat: e.latlng.lat,
												Lng: e.latlng.lng,
											})
										: undefined
								);
							}
						);
					}
				}
			);
		}

		// Useful when using shared Component methods (Maps and SearchPlaces)
		public get addedEvents(): Array<string> {
			return this._addedEvents;
		}

		public get mapTag(): string {
			return OSFramework.Maps.Helper.Constants.mapTag;
		}

		public addDrawingTools(
			drawingTools: OSFramework.Maps.DrawingTools.IDrawingTools
		): OSFramework.Maps.DrawingTools.IDrawingTools {
			super.addDrawingTools(drawingTools);

			if (this.isReady) {
				drawingTools.build();
			}

			return drawingTools;
		}

		public addFileLayer(fileLayer: OSFramework.Maps.FileLayer.IFileLayer): OSFramework.Maps.FileLayer.IFileLayer {
			super.addFileLayer(fileLayer);

			if (this.isReady) {
				fileLayer.build();
			}

			return fileLayer;
		}

		public addHeatmapLayer(
			fileLayer: OSFramework.Maps.HeatmapLayer.IHeatmapLayer
		): OSFramework.Maps.HeatmapLayer.IHeatmapLayer {
			super.addHeatmapLayer(fileLayer);

			if (this.isReady) {
				fileLayer.build();
			}

			return fileLayer;
		}

		public addMarker(marker: OSFramework.Maps.Marker.IMarker): OSFramework.Maps.Marker.IMarker {
			super.addMarker(marker);

			if (this.isReady) {
				marker.build();
			}

			return marker;
		}

		public addShape(shape: OSFramework.Maps.Shape.IShape): OSFramework.Maps.Shape.IShape {
			super.addShape(shape);

			if (this.isReady) {
				shape.build();
			}

			return shape;
		}

		public build(): void {
			super.build();

			// Make sure the center is saved before setting a default value which is going to be used
			// before the conversion of the location to coordinates gets resolved
			const currentCenter = this.config.center;

			this._provider = new L.Map(
				OSFramework.Maps.Helper.GetElementByUniqueId(this.uniqueId).querySelector(
					OSFramework.Maps.Helper.Constants.runtimeMapUniqueIdCss
				) as HTMLElement,
				{
					...this._getProviderConfig(),
					layers: [this._openStreetMapLayer],
					// Removes default zoom control to add a custom that
					// stops scrolling the page when set map on focus
					zoomControl: false,
				}
			);
			this.buildFeatures();
			this._buildMarkers();
			this._buildShapes();
			this._buildDrawingTools();
			this._addZoomButtons();
			this.finishBuild();

			// Make sure to change the center after the conversion of the location to coordinates
			this.features.center.updateCenter(currentCenter as string);
			this._setMapEvents();

			this._addOnMouseDownHandler();
			this._addMapZoomHandler();
		}

		public buildFeatures(): void {
			this._fBuilder = new Feature.FeatureBuilder(this);
			this._features = this._fBuilder.features;
			this._fBuilder.build();
		}

		public changeDrawingToolsProperty(drawingToolsId: string, propertyName: string, propertyValue: unknown): void {
			// There is only one (max) drawingTools element per map
			const drawingTools = this.drawingTools;

			if (drawingTools === undefined || drawingTools.uniqueId !== drawingToolsId) {
				console.error(`changeDrawingToolsProperty - drawingToold id:${drawingToolsId} not found.`);
			} else {
				drawingTools.changeProperty(propertyName, propertyValue);
			}
		}

		public changeFileLayerProperty(fileLayerId: string, propertyName: string, propertyValue: unknown): void {
			// There is only one (max) drawingTools element per map
			const fileLayer = this.getFileLayer(fileLayerId);

			if (!fileLayer) {
				console.error(`changeFileLayerProperty - fileLayer id:${fileLayerId} not found.`);
			} else {
				fileLayer.changeProperty(propertyName, propertyValue);
			}
		}

		public changeHeatmapLayerProperty(heatmapLayerId: string, propertyName: string, propertyValue: unknown): void {
			const heatmapLayer = this.getHeatmapLayer(heatmapLayerId);

			if (!heatmapLayer) {
				console.error(`changeHeatmapLayerProperty - heatmapLayer id:${heatmapLayerId} not found.`);
			} else {
				heatmapLayer.changeProperty(propertyName, propertyValue);
			}
		}

		public changeMarkerProperty(markerId: string, propertyName: string, propertyValue: unknown): void {
			const marker = this.getMarker(markerId);

			if (!marker) {
				console.error(`changeMarkerProperty - marker id:${markerId} not found.`);
			} else {
				marker.changeProperty(propertyName, propertyValue);
			}
		}

		public changeProperty(propertyName: string, propertyValue: unknown): void {
			const propValue = OSFramework.Maps.Enum.OS_Config_Map[propertyName];
			super.changeProperty(propertyName, propertyValue);
			if (this.isReady) {
				switch (propValue) {
					case OSFramework.Maps.Enum.OS_Config_Map.center:
						return this.features.center.updateCenter(propertyValue as string);
					case OSFramework.Maps.Enum.OS_Config_Map.offset:
						return this.features.offset.setOffset(JSON.parse(propertyValue as string));
					case OSFramework.Maps.Enum.OS_Config_Map.zoom:
						return this.features.zoom.setLevel(propertyValue as OSFramework.Maps.Enum.OSMap.Zoom);
				}
			}
		}

		public changeShapeProperty(shapeId: string, propertyName: string, propertyValue: unknown): void {
			const shape = this.getShape(shapeId);

			if (!shape) {
				console.error(`changeShapeProperty - shape id:${shapeId} not found.`);
			} else {
				shape.changeProperty(propertyName, propertyValue);
			}
		}

		public dispose(): void {
			super.dispose();

			if (this._fBuilder) {
				this._fBuilder.dispose();
			}

			this._provider = undefined;
		}

		public refresh(): void {
			//Let's stop listening to the zoom event be caused by the refreshZoom
			this._removeMapZoomHandler();

			let position = this.features.center.getCenter();

			const isDefault =
				position.lat === OSFramework.Maps.Helper.Constants.defaultMapCenter.lat &&
				position.lng === OSFramework.Maps.Helper.Constants.defaultMapCenter.lng;

			//If the user has zoomed or dragged the map and the developer intends to respect user zoom
			//then the current map center will be used.
			if (this.respectUserChange && this.hasZoomOrPositionChanged) {
				position = this.provider.getCenter();
			} else {
				//If there are markers, let's choose the map center accordingly.
				//Otherwise, the map center will be the one current center position.
				if (this.markers.length > 0) {
					// eslint-disable-next-line @typescript-eslint/no-explicit-any
					const markerProvider: any = this.markers[0].provider;
					//Validate if the marker is already created
					if (markerProvider !== undefined) {
						//If the position is default or the zoom is auto the marker position will be
						//used as center
						if (isDefault || this.features.zoom.isAutofit) {
							position = markerProvider.getLatLng();
						}
					}
				}
			}

			// Refresh the center position and zoom if needed
			this.features.center.refreshCenter(position, this.allowRefreshZoom);

			// Refresh the offset
			this.features.offset.setOffset(this.features.offset.getOffset);

			// Repaint the marker Clusterers
			this.hasMarkerClusterer() && this.features.markerClusterer.repaint();

			//Re-adding the map zoom handler
			this._addMapZoomHandler();
		}

		public refreshProviderEvents(): void {
			if (this.isReady) this._setMapEvents();
		}

		public updateHeight(): void {
			if (this.isReady) this._provider.invalidateSize();
		}

		public validateProviderEvent(eventName: string): boolean {
			return Constants.OSMap.ProviderEventNames[eventName] !== undefined;
		}
	}
}
