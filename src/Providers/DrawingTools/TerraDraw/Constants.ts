// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace Provider.DrawingTools.TerraDraw.Constants {
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
