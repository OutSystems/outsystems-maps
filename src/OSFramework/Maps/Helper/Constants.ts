/**
 * Used to store the tags used to find DOM elements
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace OSFramework.Maps.Helper.Constants {
	/************************** */
	/**       DATA BLOCKS       */
	/************************** */
	/** Tag used to find Generic Markers */
	export const markerGeneric = '[data-block*="Marker.Marker"]';
	/** Tag used to find Marker */
	export const markerTag = '[data-block="Marker.Marker"]';
	/** Tag used to find MarkerPopup */
	export const markerPopupTag = '[data-block="Marker.MarkerPopup"]';
	/** Tag used to find Generic Shapes */
	export const shapeGeneric = '[data-block*="Shapes."]';
	/** Tag used to find the Polyline Shape */
	export const shapePolylineTag = '[data-block="Shapes.Polyline"]';
	/** Tag used to find the Polygon Shape */
	export const shapePolygonTag = '[data-block="Shapes.Polygon"]';
	/** Tag used to find the Circle Shape */
	export const shapeCircleTag = '[data-block="Shapes.Circle"]';
	/** Tag used to find the Rectangle Shape */
	export const shapeRectangleTag = '[data-block="Shapes.Rectangle"]';
	/** Tag used to find the FileLayer */
	export const fileLayerTag = '[data-block="FileLayer.FileLayer"]';
	/** Tag used to find the HeatmapLayer */
	export const heatmapLayerTag = '[data-block="HeatmapLayer.HeatmapLayer"]';
	/** Tag used to find the SearchPlaces */
	export const searchPlacesTag = '[data-block="SearchPlaces.SearchPlaces"]';

	/** Tag used to find a generic widget */
	export const outsystemsWidgetTag = '[data-block]';
	/** Tag used to find StaticMap */
	export const staticMapTag = '[data-block="Maps.StaticMap"]';
	/** Tag used to find Map */
	export const mapTag = `[data-block*="Maps."]:not(${staticMapTag})`;

	/** Tag used to find the DrawingTools */
	export const drawingToolsTag = '[data-block="Drawing_Tools.Drawing_Tools"]';
	/** Tag used to find Generic Tools from DrawingTools */
	export const drawingToolsGeneric = '[data-block*="Drawing_Tools.Draw"]';

	/************************** */
	/**        DOM Tags         */
	/************************** */
	/** Tag used to find the container where the Map is going to be rendered in run time*/
	export const runtimeMapUniqueIdCss = '.runtime-map-container';
	/** Tag used to find the container where the Map's uniqueId was defined */
	export const mapUniqueIdCss = '.map-container';
	/** Tag used to find the container where the Popup of the MarkerPopup was defined */
	export const markerPopup = '.marker-popup-placeholder';
	/** Tag used to find the container where the Marker's uniqueId was defined */
	export const markerUniqueIdCss = '.ss-marker';
	/** Tag used to find the container where the StaticMap Image was defined */
	export const staticMapCss = '.staticMap-image';
	/** Tag used to find the container where the Shape's uniqueId was defined */
	export const shapeUniqueIdCss = '.ss-shape';
	/** Tag used to find the container where the DrawingTools's uniqueId was defined */
	export const drawingToolsUniqueIdCss = '.ss-drawingTools';
	/** Tag used to find the uniqueId property of a DOM element */
	export const uniqueIdAttribute = 'name';
	/** Tag used to find the container where the SearchPlaces is going to be rendered in run time*/
	export const runtimeSearchPlacesUniqueIdCss = '.ss-searchPlaces';
	/** Tag used to find the google-maps-script */
	export const googleMapsScript = 'google-maps-script';

	/************************** */
	/**       DEF VALUES        */
	/************************** */
	/** Default position for the Map on initialize (should get changed after the promise that converts the address into coordinates) */
	export const defaultMapCenter = { lat: 42.3517926, lng: -71.0467845 };
	/** Zoom that is going to be applied when the zoom is set to 0 (Auto Fit) */
	export const zoomAutofit = Enum.OSMap.Zoom.Zoom8;
	/** Default name for the shape changed event */
	export const shapeChangedEvent = 'shape_changed';
	/** Default name for the drawing completed event */
	export const drawingMarkerCompleted = 'markercomplete';
	export const drawingPolylineCompleted = 'polylinecomplete';
	export const drawingPolygonCompleted = 'polygoncomplete';
	export const drawingCircleCompleted = 'circlecomplete';
	export const drawingRectangleCompleted = 'rectanglecomplete';
	/* Default name for drawing completed event - Leaflet*/
	export const drawingLeafletCompleted = 'draw:created';
	/** Default gradient heatmap colors from google provider */
	export const gradientHeatmapColors = [
		'rgba(102, 255, 0, 0)',
		'rgba(102, 255, 0, 1)',
		'rgba(147, 255, 0, 1)',
		'rgba(193, 255, 0, 1)',
		'rgba(238, 255, 0, 1)',
		'rgba(244, 227, 0, 1)',
		'rgba(249, 198, 0, 1)',
		'rgba(255, 170, 0, 1)',
		'rgba(255, 113, 0, 1)',
		'rgba(255, 57, 0, 1)',
		'rgba(255, 0, 0, 1)',
	];

	/** Default/Custom cluster icon CSS class */
	export const clusterIconCSSClass = 'custom-clustericon';
	/** Default Failure auth code */
	export const googleMapsAuthFailure = 'gm_authFailure';

	/************************** */
	/** URL for GoogleMapsApis  */
	/************************** */
	export const googleMapsApiURL = 'https://maps.googleapis.com/maps/api';
	/** URL for GoogleMaps API to make use of the Google Map */
	export const googleMapsApiMap = `${googleMapsApiURL}/js`;
	/** URL for GoogleMaps API to make use of the Google StaticMap */
	export const googleMapsApiStaticMap = `${googleMapsApiURL}/staticmap`;
	/** Version of the Google Maps to be loaded. */
	export const gmversion = '3.55'; //Stable version Mid-February 2024.
	// In order to use the drawingTools we need to add it into the libraries via the URL = drawing
	// In order to use the heatmap we need to add it into the libraries via the URL = visualization
	// In order to use the searchplaces we need to add it into the libraries via the URL = places (in case the Map is the first to import the scripts)
	export const gmlibraries = 'drawing,visualization,places';

	/******************** */
	/** URLs for Leaflet  */
	/******************** */
	export const openStreetMapTileLayer = {
		url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
		attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
	};
}
