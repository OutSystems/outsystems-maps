namespace Provider.Maps.Google.Constants {
	// Name of the Google Maps Version in the LocalStorage
	export const googleMapsLocalStorageVersionKey = 'gmVersion';

	// Default Failure auth code
	export const googleMapsAuthFailure = 'gm_authFailure';

	// Tag used to find the google-maps-script
	export const googleMapsScript = 'google-maps-script';

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

	/************************** */
	/** URL for GoogleMapsApis  */
	/************************** */
	export const googleMapsApiURL = 'https://maps.googleapis.com/maps/api';
	// URL for GoogleMaps API to make use of the Google Map
	export const googleMapsApiMap = `${googleMapsApiURL}/js`;
	// URL for GoogleMaps API to make use of the Google StaticMap
	export const googleMapsApiStaticMap = `${googleMapsApiURL}/staticmap`;
	// In order to use the drawingTools we need to add it into the libraries via the URL = drawing
	// In order to use the heatmap we need to add it into the libraries via the URL = visualization
	// In order to use the searchplaces we need to add it into the libraries via the URL = places (in case the Map is the first to import the scripts)
	export const GoogleMapsLibraries = 'drawing,visualization,places,marker';
	// Used to check if modules are available on cycles of 100ms */
	export const checkGoogleMapsLibrariesMaxAttempts = 25;
	// Version of the Google Maps to be loaded.
	export const googleMapsVersion = '3.60'; //Stable version Mid-November 2024.
}
