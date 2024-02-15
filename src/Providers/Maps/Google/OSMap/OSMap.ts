/// <reference path="../../../../OSFramework/Maps/OSMap/AbstractMap.ts" />

// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace Provider.Maps.Google.OSMap {
	export class Map
		extends OSFramework.Maps.OSMap.AbstractMap<google.maps.Map, Configuration.OSMap.GoogleMapConfig>
		implements IMapGoogle
	{
		private _addedEvents: Array<string>;
		private _advancedFormatObj: GoogleAdvancedFormatObj;
		private _fBuilder: Feature.FeatureBuilder;
		private _gZoomChangeListener: google.maps.MapsEventListener;
		private _scriptCallback: OSFramework.Maps.Callbacks.Generic;

		constructor(mapId: string, configs: JSON) {
			super(
				mapId,
				OSFramework.Maps.Enum.ProviderType.Google,
				new Configuration.OSMap.GoogleMapConfig(configs),
				OSFramework.Maps.Enum.MapType.Map
			);
			this._addedEvents = [];
			this._scriptCallback = this._createGoogleMap.bind(this);
			this._gZoomChangeListener = undefined;
		}

		private _addMapZoomHandler(): void {
			/*
                This timeout is here due to an anomaly in the behaviour of Google Maps
                when more than one maker is added to the map, the zoom event is fired twice:
                https://stackoverflow.com/questions/20436185/google-maps-api-v3-zoom-changed-event-fired-twice-after-fitbounds-called

                However since the event is triggered asynchronously and there's no way
                to wait for it, or to know it will occur, this hack was added. I'm sorry, I'm ashamed of myself. 
            */
			setTimeout(() => {
				if (this && this._provider && this._gZoomChangeListener === undefined) {
					this._gZoomChangeListener = google.maps.event.addListener(
						this._provider,
						Constants.OSMap.ProviderEventNames.zoom_changed,
						this._mapZoomChangeCallback
					);
				}
			}, 100);
		}

		private _buildDrawingTools(): void {
			// There is only one drawingTools per map
			this.drawingTools && this.drawingTools.build();
		}

		private _buildFileLayers(): void {
			this.fileLayers.forEach((fileLayer) => fileLayer.build());
		}

		private _buildHeatmapLayers(): void {
			this.heatmapLayers.forEach((heatmapLayer) => heatmapLayer.build());
		}

		private _buildMarkers(): void {
			this.markers.forEach((marker) => marker.build());
		}

		private _buildShapes(): void {
			this.shapes.forEach((shape) => shape.build());
		}

		/**
		 * Creates the Map via GoogleMap API
		 */
		private _createGoogleMap(): void {
			const script = document.getElementById(
				OSFramework.Maps.Helper.Constants.googleMapsScript
			) as HTMLScriptElement;

			// Make sure the GoogleMaps script in the <head> of the html page contains the same apiKey as the one in the configs.
			const apiKey = /key=(.*)&libraries/.exec(script.src)[1];
			if (this.config.apiKey !== apiKey) {
				return OSFramework.Maps.Helper.ThrowError(
					this,
					OSFramework.Maps.Enum.ErrorCodes.CFG_APIKeyDiffersFromPlacesToMaps
				);
			}

			if (typeof google === 'object' && typeof google.maps === 'object') {
				// Make sure the center is saved before setting a default value which is going to be used
				// before the conversion of the location to coordinates gets resolved
				const currentCenter = this.config.center;

				this._provider = new google.maps.Map(
					OSFramework.Maps.Helper.GetElementByUniqueId(this.uniqueId).querySelector(
						OSFramework.Maps.Helper.Constants.runtimeMapUniqueIdCss
					),
					// The provider config will retrieve the default center position
					// (this.config.center = OSFramework.Maps.Helper.Constants.defaultMapCenter)
					// Which will get updated after the Map is rendered
					this._getProviderConfig()
				);
				// Check if the provider has been created with a valid APIKey
				window[OSFramework.Maps.Helper.Constants.googleMapsAuthFailure] = () =>
					this.mapEvents.trigger(
						OSFramework.Maps.Event.OSMap.MapEventType.OnError,
						this,
						OSFramework.Maps.Enum.ErrorCodes.LIB_InvalidApiKeyMap
					);

				this.buildFeatures();
				this._buildMarkers();
				this._buildShapes();
				this._buildDrawingTools();
				this._buildFileLayers();
				this._buildHeatmapLayers();
				this.finishBuild();

				// Make sure to change the center after the conversion of the location to coordinates
				this.features.center.updateCenter(currentCenter as string);

				// Make sure the style is converted from an id to the correspondent JSON
				this._provider.setOptions({
					styles: GetStyleByStyleId(this.config.style),
					...this._advancedFormatObj,
				});

				// We can only set the events on the provider after its creation
				this._setMapEvents(this._advancedFormatObj.mapEvents);
				this._addMapZoomHandler();
			} else {
				throw Error(`The google.maps lib has not been loaded.`);
			}
		}

		private _getProviderConfig(): google.maps.MapOptions {
			// Make sure the center has a default value before the conversion of the location to coordinates
			this.config.center = OSFramework.Maps.Helper.Constants.defaultMapCenter;
			// Take care of the advancedFormat options which can override the previous configuration
			this._advancedFormatObj = OSFramework.Maps.Helper.JsonFormatter(
				this.config.advancedFormat
			) as unknown as GoogleAdvancedFormatObj;

			return this.config.getProviderConfig();
		}

		private _removeMapZoomHandler(): void {
			if (this._gZoomChangeListener) {
				google.maps.event.removeListener(this._gZoomChangeListener);
				this._gZoomChangeListener = undefined;
			}
		}

		private _setMapEvents(events?: Array<string>): void {
			SharedComponents.RemoveEventsFromProvider(this);

			// OnEventTriggered Event (other events that can be set on the advancedFormat of the Map)
			// We are deprecating the advancedFormat
			// TODO: TO BE REMOVED SOON
			if (
				this.mapEvents.hasHandlers(OSFramework.Maps.Event.OSMap.MapEventType.OnEventTriggered) &&
				events !== undefined
			) {
				events.forEach((eventName: string) => {
					this._addedEvents.push(eventName);
					this._provider.addListener(eventName, () => {
						this.mapEvents.trigger(
							OSFramework.Maps.Event.OSMap.MapEventType.OnEventTriggered,
							this,
							eventName
						);
					});
				});
			}

			// Other Provider Events (OS Map Event Block)
			// Any events that got added to the mapEvents via the API Subscribe method will have to be taken care here
			// If the Event type of each handler is MapProviderEvent, we want to make sure to add that event to the listeners of the Google Maps provider (e.g. click, dblclick, contextmenu, etc)
			this.mapEvents.handlers.forEach(
				(handler: OSFramework.Maps.Event.IEvent<OSFramework.Maps.OSMap.IMap>, eventName) => {
					if (handler instanceof OSFramework.Maps.Event.OSMap.MapProviderEvent) {
						this._addedEvents.push(eventName);
						this._provider.addListener(
							// Name of the event (e.g. click, dblclick, contextmenu, etc)
							Constants.OSMap.ProviderEventNames[eventName],
							// Callback CAN have an attribute (e) which is of the type MapMouseEvent
							// Trigger the event by specifying the ProviderEvent MapType and the coords (lat, lng) if the callback has the attribute MapMouseEvent
							(e?: google.maps.MapMouseEvent) => {
								this.mapEvents.trigger(
									OSFramework.Maps.Event.OSMap.MapEventType.ProviderEvent,
									this,
									eventName,
									e !== undefined
										? JSON.stringify(
												new OSFramework.Maps.OSStructures.OSMap.OSCoordinates(
													e.latLng.lat(),
													e.latLng.lng()
												)
											)
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

			/**
			 * Initializes the Google Map.
			 * 1) Add the script from GoogleAPIS to the header of the page
			 * 2) Creates the Map via GoogleMap API
			 */
			SharedComponents.InitializeScripts(this.config.apiKey, this._scriptCallback);
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
					case OSFramework.Maps.Enum.OS_Config_Map.apiKey:
						if (this.config.apiKey !== '') {
							this.mapEvents.trigger(
								OSFramework.Maps.Event.OSMap.MapEventType.OnError,
								this,
								OSFramework.Maps.Enum.ErrorCodes.CFG_APIKeyAlreadySetMap
							);
						}
						return;
					case OSFramework.Maps.Enum.OS_Config_Map.center:
						return this.features.center.updateCenter(propertyValue as string);
					case OSFramework.Maps.Enum.OS_Config_Map.offset:
						return this.features.offset.setOffset(JSON.parse(propertyValue as string));
					case OSFramework.Maps.Enum.OS_Config_Map.zoom:
						return this.features.zoom.setLevel(propertyValue as OSFramework.Maps.Enum.OSMap.Zoom);
					case OSFramework.Maps.Enum.OS_Config_Map.type:
						return this._provider.setMapTypeId(propertyValue as string);
					case OSFramework.Maps.Enum.OS_Config_Map.style:
						return this._provider.setOptions({
							styles: GetStyleByStyleId(propertyValue as number),
						});
					case OSFramework.Maps.Enum.OS_Config_Map.advancedFormat:
						propertyValue = OSFramework.Maps.Helper.JsonFormatter(propertyValue as string) as unknown;
						// Make sure the MapEvents that are associated in the advancedFormat get updated
						this._setMapEvents((propertyValue as GoogleAdvancedFormatObj).mapEvents);
						return this._provider.setOptions(propertyValue);
					case OSFramework.Maps.Enum.OS_Config_Map.showTraffic:
						return this.features.trafficLayer.setState(propertyValue as boolean);
					case OSFramework.Maps.Enum.OS_Config_Map.markerClustererActive:
					case OSFramework.Maps.Enum.OS_Config_Map.markerClustererMaxZoom:
					case OSFramework.Maps.Enum.OS_Config_Map.markerClustererMinClusterSize:
					case OSFramework.Maps.Enum.OS_Config_Map.markerClustererZoomOnClick:
						return this.features.markerClusterer.changeProperty(propertyName, propertyValue);
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

			//If there are markers, let's choose the map center accordingly.
			//Otherwise, the map center will be the one defined in the configs.
			if (this.markers.length > 0) {
				if (this.markers.length > 1) {
					//As the map has more than one marker, let's see if the map
					//center should be changed.
					//If the user hasn't change zoom, or the developer is ignoring it (current behavior).
					if (this.allowRefreshZoom) {
						//Let's check if the marker provider is ready to be used.
						if (this.markers[0].provider !== undefined) {
							//If the map center, is the same as the default, then the map will ignore it.
							//Otherwise, the isAutofit config will be checked, and if false, then the current
							//center will not be changed.
							if (isDefault || this.features.zoom.isAutofit) {
								//Let's use the first marker as the center of the map.
								position = this.markers[0].provider.position.toJSON();
							}
						}
					} else {
						//If the user has zoomed and the developer intends to respect user zoom
						//then the current map center will be used.
						position = this.provider.getCenter().toJSON();
					}
				} else if (this.markers[0].provider !== undefined) {
					//If there's only one marker, and is already created, its location will be
					//used as the map center.
					position = this.markers[0].provider.position.toJSON();
				}
			}

			// Refresh the center position
			this.features.center.refreshCenter(position);

			if (this.allowRefreshZoom) {
				// Refresh the zoom
				this.features.zoom.refreshZoom();
			}

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

		public setClusterRenderer(renderer: OSFramework.Maps.Feature.IMarkerClustererRender) {
			if (this.isReady) {
				this.features.markerClusterer.setClusterRenderer(renderer);
			}
		}

		public validateProviderEvent(eventName: string): boolean {
			return Constants.OSMap.ProviderEventNames[eventName] !== undefined;
		}
	}
}
