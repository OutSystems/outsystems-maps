// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace OSFramework.Maps.OSMap {
	export interface IMap extends Interface.IBuilder, Interface.ISearchById, Interface.IDisposable {
		/** Map configuration */
		config: Configuration.IConfigurationMap;
		/** Get the DrawingTools from the Map */
		drawingTools: OSFramework.Maps.DrawingTools.IDrawingTools;
		/** Exposed features of the Map */
		features: OSFramework.Maps.Feature.ExposedFeatures;
		/** Get all FileLayers from the Map */
		fileLayers: Array<OSFramework.Maps.FileLayer.IFileLayer>;
		/** Boolean that indicates if the Map is ready */
		isReady: boolean;
		/** Events from the Map */
		mapEvents: Event.OSMap.MapEventsManager;
		/** Tag of the Map Block from OS */
		mapTag: string;
		/** Get all Markers from the Map */
		markers: Array<OSFramework.Maps.Marker.IMarker>;
		/** Get all Markers that have finished building its provider */
		markersReady: Array<unknown>;
		/** Map provider */
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		provider: any;
		/** Map provider Type (google, leaflet) */
		providerType: OSFramework.Maps.Enum.ProviderType;
		/** Get all shapes from the Map */
		shapes: Array<OSFramework.Maps.Shape.IShape>;
		/** Id of the Map */
		uniqueId: string;
		/** Id of the Map widget */
		widgetId: string;

		/**
		 * Add new DrawingTools Element to the Map
		 * @param drawingTools DrawingTools that will be added to the Map
		 * @returns DrawingTools that has been created
		 */
		addDrawingTools(
			drawingTools: OSFramework.Maps.DrawingTools.IDrawingTools
		): OSFramework.Maps.DrawingTools.IDrawingTools;
		/**
		 * Add new FileLayer Element to the Map
		 * @param fileLayer FileLayer that will be added to the Map
		 * @returns FileLayer that has been created
		 */
		addFileLayer(fileLayer: OSFramework.Maps.FileLayer.IFileLayer): OSFramework.Maps.FileLayer.IFileLayer;
		/**
		 * Add new HeatmapLayer Element to the Map
		 * @param heatmapLayer HeatmapLayer that will be added to the Map
		 * @returns HeatmapLayer that has been created
		 */
		addHeatmapLayer(
			heatmapLayer: OSFramework.Maps.HeatmapLayer.IHeatmapLayer
		): OSFramework.Maps.HeatmapLayer.IHeatmapLayer;
		/**
		 * Add new Marker to the Map
		 * @param marker Marker that will be added to the Map
		 * @returns Marker that has been created
		 */
		addMarker(marker: OSFramework.Maps.Marker.IMarker): OSFramework.Maps.Marker.IMarker;
		/**
		 * Add new Shape to the Map
		 * @param shape Shape that will be added to the Map
		 * @returns Shape that has been created
		 */
		addShape(shape: OSFramework.Maps.Shape.IShape): OSFramework.Maps.Shape.IShape;
		/**
		 * Stops the current refresh from being refreshed.
		 *
		 * @memberof IMap
		 */
		cancelScheduledResfresh(): void;
		/**
		 * Change property of a drawingTools from the DrawingTools by specifying the property name and the new value
		 * @param drawingToolsId id of the DrawingTools
		 * @param propertyName name of the property
		 * @param propertyValue new value of the property
		 */
		changeDrawingToolsProperty(drawingToolsId: string, propertyName: string, propertyValue: unknown): void;
		/**
		 * Change property of a fileLayer from the FileLayer by specifying the property name and the new value
		 * @param fileLayerId id of the FileLayer
		 * @param propertyName name of the property
		 * @param propertyValue new value of the property
		 */
		changeFileLayerProperty(fileLayerId: string, propertyName: string, propertyValue: unknown): void;
		/**
		 * Change property of a heatmapLayer from the HeatmapLayer by specifying the property name and the new value
		 * @param heatmapLayerId id of the HeatmapLayer
		 * @param propertyName name of the property
		 * @param propertyValue new value of the property
		 */
		changeHeatmapLayerProperty(heatmapLayerId: string, propertyName: string, propertyValue: unknown): void;
		/**
		 * Change property of a marker from the Map by specifying the property name and the new value
		 * @param markerId id of the Marker
		 * @param propertyName name of the property
		 * @param propertyValue new value of the property
		 */
		changeMarkerProperty(markerId: string, propertyName: string, propertyValue: unknown): void;
		/**
		 * Change property of the Map by specifying the property name and the new value
		 * @param propertyName name of the property
		 * @param propertyValue new value of the property
		 */
		changeProperty(propertyName: string, propertyValue: unknown): void;
		/**
		 * Change property of a shape from the Map by specifying the property name and the new value
		 * @param shapeId id of the Shape
		 * @param propertyName name of the property
		 * @param propertyValue new value of the property
		 */
		changeShapeProperty(shapeId: string, propertyName: string, propertyValue: unknown): void;
		/**
		 * Get the FileLayer from the Map by giving a fileLayerId
		 * @param fileLayerId id of the FileLayer
		 * @returns FileLayer found via the specified fileLayerId
		 */
		getFileLayer(fileLayerId: string): OSFramework.Maps.FileLayer.IFileLayer;
		/**
		 * Get the Marker from the Map by giving a markerId
		 * @param markerId id of the marker
		 * @returns Marker found via the specified markerId
		 */
		getMarker(markerId: string): OSFramework.Maps.Marker.IMarker;
		/**
		 * Get the Shape from the Map by giving a shapeId
		 * @param shapeId id of the shape
		 * @returns Shape found via the specified shapeId
		 */
		getShape(shapeId: string): OSFramework.Maps.Shape.IShape;
		/**
		 * Checks if the Map has a specific FileLayer by giving a fileLayerId
		 * @param fileLayerId id of the fileLayer
		 */
		hasFileLayer(fileLayerId: string): boolean;
		/**
		 * Checks if the Map has a specific HeatmapLayer by giving a heatmapLayerId
		 * @param heatmapLayerId id of the heatmapLayer
		 */
		hasHeatmapLayer(heatmapLayerId: string): boolean;
		/**
		 * Checks if the Map has a specific Marker by giving a markerId
		 * @param markerId id of the marker
		 */
		hasMarker(markerId: string): boolean;
		/**
		 * Checks if the Map has a the markerClusterer feature enabled
		 */
		hasMarkerClusterer(): boolean;
		/**
		 * Checks if the Map has a specific Shape by giving a shapeId
		 * @param shapeId id of the shape
		 */
		hasShape(shapeId: string): boolean;
		/**
		 * Refreshes the Map after changing zoom or center.
		 * Can be used to reset to the defined zoom, center and offset configurations.
		 */
		refresh(): void;
		/**
		 * Refreshes the Events of the Map Provider after Subscribing/Unsubscribing events
		 */
		refreshProviderEvents(): void;
		/**
		 * Remove all FileLayers from the Map
		 */
		removeAllFileLayers(): void;
		/**
		 * Remove all Markers from the Map
		 */
		removeAllMarkers(): void;
		/**
		 * Remove all Shapes from the Map
		 */
		removeAllShapes(): void;
		/**
		 * Remove a DrawingTools from the Map by giving a drawingToolsId
		 * @param drawingToolsId id of the DrawingTools
		 */
		removeDrawingTools(drawingToolsId: string): void;
		/**
		 * Remove a FileLayer from the Map by giving a fileLayerId
		 * @param fileLayerId id of the FileLayer
		 */
		removeFileLayer(fileLayerId: string): void;
		/**
		 * Remove a HeatmapLayer from the Map by giving a heatmapLayerId
		 * @param heatmapLayerId id of the HeatmapLayer
		 */
		removeHeatmapLayer(heatmapLayerId: string): void;
		/**
		 * Remove a Marker from the Map by giving a markerId
		 * @param markerId id of the marker
		 */
		removeMarker(markerId: string): void;
		/**
		 * Remove a Shape from the Map by giving a shapeId
		 * @param shapeId id of the shape
		 */
		removeShape(shapeId: string): void;
		/**
		 * Schedules the map to be refreshed so, that the bulk operations are made fast.
		 * @memberof IMap
		 */
		scheduleRefresh(): void;
		/**
		 * Adds a custom render to the Clusters. Applicable to some providers only.
		 * @param {OSFramework.Maps.Feature.IMarkerClusterer} renderer
		 * @memberof IMap
		 */
		setClusterRenderer?(renderer: OSFramework.Maps.Feature.IMarkerClustererRender): void;
		/**
		 * Updates the Height of the Map by refreshing/updating the provider
		 */
		updateHeight(): void;
		/**
		 * Check if the event name is valid for the provider events
		 * @param eventName name of the event from provider
		 */
		validateProviderEvent(eventName: string): boolean;
	}
}
