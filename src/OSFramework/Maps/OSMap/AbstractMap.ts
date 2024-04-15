// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace OSFramework.Maps.OSMap {
	export abstract class AbstractMap<W, Z extends Configuration.IConfigurationMap> implements IMapGeneric<W> {
		/** Configuration reference */
		private _config: Z;
		private _drawingTools: DrawingTools.IDrawingTools;
		private _fileLayers: Map<string, FileLayer.IFileLayer>;
		private _fileLayersSet: Set<FileLayer.IFileLayer>;
		private _heatmapLayers: Map<string, HeatmapLayer.IHeatmapLayer>;
		private _heatmapLayersSet: Set<HeatmapLayer.IHeatmapLayer>;
		private _isReady: boolean;
		private _mapEvents: Event.OSMap.MapEventsManager;
		private _mapRefreshRequest: number;
		private _mapType: Enum.MapType;
		private _markers: Map<string, Marker.IMarker>;
		private _markersSet: Set<Marker.IMarker>;
		private _providerType: Enum.ProviderType;
		private _shapes: Map<string, Shape.IShape>;
		private _shapesSet: Set<Shape.IShape>;
		private _uniqueId: string;
		private _widgetId: string;
		private _zoomChanged: boolean;

		protected _features: Feature.ExposedFeatures;
		protected _mapZoomChangeCallback: Maps.Callbacks.Generic;
		protected _provider: W;

		constructor(uniqueId: string, providerType: Enum.ProviderType, config: Z, mapType: Enum.MapType) {
			this._uniqueId = uniqueId;
			this._fileLayers = new Map<string, FileLayer.IFileLayer>();
			this._heatmapLayers = new Map<string, HeatmapLayer.IHeatmapLayer>();
			this._markers = new Map<string, Marker.IMarker>();
			this._shapes = new Map<string, Shape.IShape>();
			this._fileLayersSet = new Set<FileLayer.IFileLayer>();
			this._heatmapLayersSet = new Set<HeatmapLayer.IHeatmapLayer>();
			this._markersSet = new Set<Marker.IMarker>();
			this._shapesSet = new Set<Shape.IShape>();
			this._config = config;
			this._isReady = false;
			this._mapEvents = new Event.OSMap.MapEventsManager(this);
			this._mapType = mapType;
			this._mapRefreshRequest = 0;
			this._providerType = providerType;
			this._zoomChanged = false;
			this._mapZoomChangeCallback = this._mapZoomChangeHandler.bind(this);
		}
		public abstract get mapTag(): string;

		protected get allowRefreshZoom(): boolean {
			return !(this.config.respectUserZoom && this._zoomChanged);
		}

		public get shapes(): Shape.IShape[] {
			return Array.from(this._shapesSet);
		}

		public get config(): Z {
			return this._config;
		}

		public get features(): Feature.ExposedFeatures {
			return this._features;
		}

		public get isReady(): boolean {
			return this._isReady;
		}

		public get drawingTools(): DrawingTools.IDrawingTools {
			return this._drawingTools;
		}

		public get fileLayers(): FileLayer.IFileLayer[] {
			return Array.from(this._fileLayersSet);
		}

		public get heatmapLayers(): HeatmapLayer.IHeatmapLayer[] {
			return Array.from(this._heatmapLayersSet);
		}

		public get markers(): Marker.IMarker[] {
			return Array.from(this._markersSet);
		}

		public get markersReady(): unknown[] {
			// We need to go through all the markers and only get the ones that are ready (or have the provider defined)
			// Then we need to return the providers inside a list
			return this.markers.filter((marker) => marker.isReady).map((marker) => marker.provider);
		}

		public get mapEvents(): Event.OSMap.MapEventsManager {
			return this._mapEvents;
		}

		public get provider(): W {
			return this._provider;
		}

		public get providerType(): Enum.ProviderType {
			return this._providerType;
		}

		public get uniqueId(): string {
			return this._uniqueId;
		}

		public get widgetId(): string {
			return this._widgetId;
		}

		private _mapZoomChangeHandler(): void {
			if (this.config.respectUserZoom) {
				this._zoomChanged = true;
			}
		}

		protected finishBuild(): void {
			this._isReady = true;

			this.mapEvents.trigger(Event.OSMap.MapEventType.Initialized, this);
		}

		public addDrawingTools(drawingTools: DrawingTools.IDrawingTools): DrawingTools.IDrawingTools {
			this._drawingTools = drawingTools;

			return drawingTools;
		}

		public addFileLayer(fileLayer: FileLayer.IFileLayer): FileLayer.IFileLayer {
			this._fileLayers.set(fileLayer.uniqueId, fileLayer);
			this._fileLayersSet.add(fileLayer);

			return fileLayer;
		}

		public addHeatmapLayer(heatmapLayer: HeatmapLayer.IHeatmapLayer): HeatmapLayer.IHeatmapLayer {
			this._heatmapLayers.set(heatmapLayer.uniqueId, heatmapLayer);
			this._heatmapLayersSet.add(heatmapLayer);

			return heatmapLayer;
		}

		public addMarker(marker: Marker.IMarker): Marker.IMarker {
			this._markers.set(marker.uniqueId, marker);
			this._markersSet.add(marker);

			return marker;
		}

		public addShape(shape: Shape.IShape): Shape.IShape {
			this._shapes.set(shape.uniqueId, shape);
			this._shapesSet.add(shape);

			return shape;
		}

		public build(): void {
			this._widgetId = Helper.GetElementByUniqueId(this.uniqueId).closest(this.mapTag).id;
		}

		public cancelScheduledResfresh(): void {
			if (this._mapRefreshRequest !== 0) {
				clearTimeout(this._mapRefreshRequest);
				this._mapRefreshRequest = 0;
			}
		}

		public changeProperty(propertyName: string, propertyValue: unknown): void {
			//Update Map's config when the property is available
			if (this.config.hasOwnProperty(propertyName)) {

				// Check if is an object to parse the correct value
				if (typeof this.config[propertyName] === 'object') {
					propertyValue = JSON.parse(propertyValue as string);
				}

				this.config[propertyName] = propertyValue;

				if (Maps.Enum.OS_Config_Map.respectUserZoom === Maps.Enum.OS_Config_Map[propertyName]) {
					this._zoomChanged = false;
				}
			} else {
				this.mapEvents.trigger(
					Event.OSMap.MapEventType.OnError,
					this,
					Enum.ErrorCodes.GEN_InvalidChangePropertyMap,
					`${propertyName}`
				);
			}
		}

		public dispose(): void {
			this._isReady = false;
			// Let's make sure we remove both markers and shapes from the map
			this._markers.forEach((marker: Marker.IMarker, markerId: string) => {
				this.removeMarker(markerId);
			});
			this._shapes.forEach((shape: Shape.IShape, shapeId: string) => {
				this.removeShape(shapeId);
			});
			// Let's make sure we remove the DrawingTools from the map
			this.drawingTools && this.removeDrawingTools(this.drawingTools.uniqueId);
		}

		public equalsToID(mapId: string): boolean {
			return mapId === this._uniqueId || mapId === this._widgetId;
		}

		public getFileLayer(fileLayerId: string): FileLayer.IFileLayer {
			if (this._fileLayers.has(fileLayerId)) {
				return this._fileLayers.get(fileLayerId);
			} else {
				return this.fileLayers.find((p) => p && p.equalsToID(fileLayerId));
			}
		}

		public getHeatmapLayer(heatmapLayerId: string): HeatmapLayer.IHeatmapLayer {
			if (this._heatmapLayers.has(heatmapLayerId)) {
				return this._heatmapLayers.get(heatmapLayerId);
			} else {
				return this.heatmapLayers.find((p) => p && p.equalsToID(heatmapLayerId));
			}
		}

		public getMarker(markerId: string): Marker.IMarker {
			if (this._markers.has(markerId)) {
				return this._markers.get(markerId);
			} else {
				return this.markers.find((p) => p && p.equalsToID(markerId));
			}
		}

		public getShape(shape: string): Shape.IShape {
			if (this._shapes.has(shape)) {
				return this._shapes.get(shape);
			} else {
				return this.shapes.find((p) => p && p.equalsToID(shape));
			}
		}

		public hasFileLayer(fileLayerId: string): boolean {
			return this._fileLayers.has(fileLayerId);
		}

		public hasHeatmapLayer(heatmapLayerId: string): boolean {
			return this._heatmapLayers.has(heatmapLayerId);
		}

		public hasMarker(markerId: string): boolean {
			return this._markers.has(markerId);
		}

		public hasMarkerClusterer(): boolean {
			return this._features?.markerClusterer?.isEnabled;
		}

		public hasShape(shapeId: string): boolean {
			return this._shapes.has(shapeId);
		}

		public removeAllFileLayers(): void {
			if (this._mapType === Enum.MapType.StaticMap && this.isReady) {
				this.mapEvents.trigger(
					Event.OSMap.MapEventType.OnError,
					this,
					Enum.ErrorCodes.CFG_CantChangeParamsStaticMap
				);
				return;
			}
			this._fileLayers.forEach((marker) => {
				marker.dispose();
			});

			this._fileLayers.clear();
			this._fileLayersSet.clear();
			if (this._isReady) {
				this.refresh();
			}
		}

		public removeAllMarkers(): void {
			if (this._mapType === Enum.MapType.StaticMap && this.isReady) {
				this.mapEvents.trigger(
					Event.OSMap.MapEventType.OnError,
					this,
					Enum.ErrorCodes.CFG_CantChangeParamsStaticMap
				);
				return;
			}
			this._markers.forEach((marker) => {
				// Make sure the marker is removed from any existent cluster
				// But first ensure that map.features exist as well as the features.markerClusterer
				this.hasMarkerClusterer() && this.features.markerClusterer.removeMarker(marker);
				marker.dispose();
			});

			this._markers.clear();
			this._markersSet.clear();
			if (this._isReady) {
				this.refresh();
			}
		}

		public removeAllShapes(): void {
			if (this._mapType === Enum.MapType.StaticMap && this.isReady) {
				this.mapEvents.trigger(
					Event.OSMap.MapEventType.OnError,
					this,
					Enum.ErrorCodes.CFG_CantChangeParamsStaticMap
				);
				return;
			}
			this._shapes.forEach((shape) => {
				shape.dispose();
			});

			this._shapes.clear();
			this._shapesSet.clear();
			if (this._isReady) {
				this.refresh();
			}
		}

		public removeDrawingTools(drawingToolsId: string): void {
			if (this._mapType === Enum.MapType.StaticMap && this.isReady) {
				this.mapEvents.trigger(
					Event.OSMap.MapEventType.OnError,
					this,
					Enum.ErrorCodes.CFG_CantChangeParamsStaticMap
				);
				return;
			}
			if (this._drawingTools && this._drawingTools.uniqueId === drawingToolsId) {
				this._drawingTools.dispose();
				this._drawingTools = undefined;
			}
		}

		public removeFileLayer(fileLayerId: string): void {
			if (this._mapType === Enum.MapType.StaticMap && this.isReady) {
				this.mapEvents.trigger(
					Event.OSMap.MapEventType.OnError,
					this,
					Enum.ErrorCodes.CFG_CantChangeParamsStaticMap
				);
				return;
			}
			if (this._fileLayers.has(fileLayerId)) {
				const fileLayer = this._fileLayers.get(fileLayerId);

				fileLayer.dispose();
				this._fileLayers.delete(fileLayerId);
				this._fileLayersSet.delete(fileLayer);
			}
		}

		public removeHeatmapLayer(heatmapLayerId: string): void {
			if (this._mapType === Enum.MapType.StaticMap && this.isReady) {
				this.mapEvents.trigger(
					Event.OSMap.MapEventType.OnError,
					this,
					Enum.ErrorCodes.CFG_CantChangeParamsStaticMap
				);
				return;
			}
			if (this._heatmapLayers.has(heatmapLayerId)) {
				const fileLayer = this._heatmapLayers.get(heatmapLayerId);

				fileLayer.dispose();
				this._heatmapLayers.delete(heatmapLayerId);
				this._heatmapLayersSet.delete(fileLayer);
			}
		}

		public removeMarker(markerId: string): void {
			if (this._mapType === Enum.MapType.StaticMap && this.isReady) {
				this.mapEvents.trigger(
					Event.OSMap.MapEventType.OnError,
					this,
					Enum.ErrorCodes.CFG_CantChangeParamsStaticMap
				);
				return;
			}
			if (this._markers.has(markerId)) {
				const marker = this._markers.get(markerId);

				// Make sure the marker is removed from any existent cluster
				// But first ensure that map.features exist as well as the features.markerClusterer
				this.hasMarkerClusterer() && this.features.markerClusterer.removeMarker(marker);
				marker.dispose();
				this._markers.delete(markerId);
				this._markersSet.delete(marker);
				// After removing a marker, we need to refresh the Map to reflect the zoom, offset and center position of the Map
				if (this._isReady) {
					this.refresh();
				}
			}
		}

		public removeShape(shapeId: string): void {
			if (this._mapType === Enum.MapType.StaticMap && this.isReady) {
				this.mapEvents.trigger(
					Event.OSMap.MapEventType.OnError,
					this,
					Enum.ErrorCodes.CFG_CantChangeParamsStaticMap
				);
				return;
			}
			if (this._shapes.has(shapeId)) {
				const shape = this._shapes.get(shapeId);

				shape.dispose();
				this._shapes.delete(shapeId);
				this._shapesSet.delete(shape);
				// After removing a shape, we need to refresh the Map to reflect the zoom, offset and center position of the Map
				if (this._isReady) {
					this.refresh();
				}
			}
		}

		public scheduleRefresh(): void {
			this.cancelScheduledResfresh();

			this._mapRefreshRequest = setTimeout(() => {
				this.refresh();
			}, 0);
		}

		public updateHeight(): void {
			// Because only some specific map providers like Leaflet Provider need to update or refresh the map after changing its height,
			// this function doesn't need any logic
			// but it should be overridden on the respective providers that might need to update the map after changing the height
			return;
		}
		public abstract changeDrawingToolsProperty(
			drawingToolsId: string,
			propertyName: string,
			propertyValue: unknown
		): void;

		public abstract changeFileLayerProperty(
			fileLayerId: string,
			propertyName: string,
			propertyValue: unknown
		): void;

		public abstract changeHeatmapLayerProperty(
			heatmapLayerId: string,
			propertyName: string,
			propertyValue: unknown
		): void;

		public abstract changeMarkerProperty(markerId: string, propertyName: string, propertyValue: unknown): void;

		public abstract changeShapeProperty(shapeId: string, propertyName: string, propertyValue: unknown): void;

		public abstract refresh(): void;
		public abstract refreshProviderEvents(): void;
		public abstract validateProviderEvent(eventName: string): boolean;
	}
}
