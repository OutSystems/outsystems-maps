namespace Provider.Layers.deckgl.Constants {
	/** Default fill color with 25% opacity if not specified in the KML properties. */
	export const DEFAULT_FILL_COLOR: [number, number, number, number] = [66, 133, 244, 60];
	/** Default icon key used when no specific icon is provided. */
	export const DEFAULT_ICON_KEY = '__default__';
	/** Default icon URL used when no specific icon is provided. */
	export const DEFAULT_ICON_URL = 'img/OutSystemsMaps.iconMarker.png';
	/** Default stroke color with 100% opacity if not specified in the KML properties. */
	export const DEFAULT_STROKE_COLOR: [number, number, number, number] = [66, 133, 244, 255];
	/** Size of each icon cell in the atlas. */
	export const ICON_CELL_SIZE = 64;
}
