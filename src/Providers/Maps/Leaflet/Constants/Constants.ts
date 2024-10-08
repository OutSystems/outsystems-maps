namespace Provider.Maps.Leaflet.Constants {
	// Version of Leaflet
	export const leafletVersion = '1.0.2';

	/* Default name for drawing completed event - Leaflet*/
	export const drawingLeafletCompleted = 'draw:created';

	/******************** */
	/** URLs for Leaflet  */
	/******************** */
	export const openStreetMapTileLayer = {
		url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
		attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
	};
}
