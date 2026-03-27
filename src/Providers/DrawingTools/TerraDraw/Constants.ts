// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace Provider.DrawingTools.TerraDraw.Constants {
	/**
	 * TerraDraw mode name strings.
	 * These values must exactly match the mode identifiers used internally by
	 * TerraDraw (passed to TerraDraw.setMode() and returned in finish event
	 * context.mode). Do not rename them without also updating the TerraDraw
	 * mode constructors and the CSS data-mode selectors in DrawingTools.css.
	 */
	export const enum ModeName {
		Circle = 'circle',
		LineString = 'linestring',
		Marker = 'marker',
		Polygon = 'polygon',
		Rectangle = 'rectangle',
		Select = 'select',
	}

	/** DOM id used to guard against injecting the stylesheet more than once. */
	export const drawingToolsCssId = 'os-terradraw-styles';

	/** DOM classes */
	export const cssToolbar = 'os-terradraw-toolbar';
	export const cssButton = 'os-terradraw-btn';
	export const cssButtonActive = 'os-terradraw-btn--active';
	export const cssButtonIcon = 'os-terradraw-btn__icon';
	export const cssMapPositioned = 'os-terradraw-map-positioned';

	/** Maps TerraDraw mode name → human-readable accessible label */
	export const modeLabels: Record<string, string> = {
		[Constants.ModeName.Marker]: 'Marker',
		[Constants.ModeName.LineString]: 'Polyline',
		[Constants.ModeName.Polygon]: 'Polygon',
		[Constants.ModeName.Circle]: 'Circle',
		[Constants.ModeName.Rectangle]: 'Rectangle',
	};

	/** Default position */
	export const defaultPosition = 'TOP_CENTER';

	/** Maps OS position string → toolbar BEM modifier class */
	export const positionClasses: Record<string, string> = {
		TOP_LEFT: `${cssToolbar}--top-left`,
		TOP_CENTER: `${cssToolbar}--top-center`,
		TOP_RIGHT: `${cssToolbar}--top-right`,
		LEFT_TOP: `${cssToolbar}--left-top`,
		LEFT_CENTER: `${cssToolbar}--left-center`,
		LEFT_BOTTOM: `${cssToolbar}--left-bottom`,
		RIGHT_TOP: `${cssToolbar}--right-top`,
		RIGHT_CENTER: `${cssToolbar}--right-center`,
		RIGHT_BOTTOM: `${cssToolbar}--right-bottom`,
		BOTTOM_LEFT: `${cssToolbar}--bottom-left`,
		BOTTOM_CENTER: `${cssToolbar}--bottom-center`,
		BOTTOM_RIGHT: `${cssToolbar}--bottom-right`,
	};
}
