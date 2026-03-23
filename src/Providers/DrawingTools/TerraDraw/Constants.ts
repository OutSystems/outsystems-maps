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
}
