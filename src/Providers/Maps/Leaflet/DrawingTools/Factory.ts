// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace Provider.Maps.Leaflet.DrawingTools {
	/**
	 * Factory that will create the correct DrawingTools object based on the type passed.
	 *
	 * @namespace DrawingToolsFactory
	 */
	export namespace DrawingToolsFactory {
		/**
		 * Function that will create the correct DrawingTools object based on the type passed.
		 *
		 * @param map Map that the DrawingTools will be added to
		 * @param drawingToolsId Id of the DrawingTools
		 * @param configs Configurations of the DrawingTools
		 * @returns DrawingTools object
		 */
		export function MakeDrawingTools(
			map: OSFramework.Maps.OSMap.IMap,
			drawingToolsId: string,
			configs: JSON
		): OSFramework.Maps.DrawingTools.IDrawingTools {
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			//@ts-ignore
			return new DrawingTools(map, drawingToolsId, configs);
		}

		/**
		 * Function that will create the correct Tool object based on the type passed.
		 *
		 * @param map Map that the Tool will be added to
		 * @param drawingTools DrawingTools that the Tool will be added to
		 * @param toolId Id of the Tool
		 * @param type Type of the Tool
		 * @param configs Configurations of the Tool
		 * @returns Tool object
		 */
		export function MakeTool(
			map: OSFramework.Maps.OSMap.IMap,
			drawingTools: OSFramework.Maps.DrawingTools.IDrawingTools,
			toolId: string,
			type: OSFramework.Maps.Enum.DrawingToolsTypes,
			configs: JSON
		): OSFramework.Maps.DrawingTools.ITool {
			switch (type) {
				case OSFramework.Maps.Enum.DrawingToolsTypes.Marker:
					return new DrawMarker(map, drawingTools, toolId, type, configs);
				case OSFramework.Maps.Enum.DrawingToolsTypes.Polyline:
					return new DrawPolyline(map, drawingTools, toolId, type, configs);
				case OSFramework.Maps.Enum.DrawingToolsTypes.Polygon:
					return new DrawPolygon(map, drawingTools, toolId, type, configs);
				case OSFramework.Maps.Enum.DrawingToolsTypes.Circle:
					return new DrawCircle(map, drawingTools, toolId, type, configs);
				case OSFramework.Maps.Enum.DrawingToolsTypes.Rectangle:
					return new DrawRectangle(map, drawingTools, toolId, type, configs);
				default:
					throw new Error(`There is no factory for this type of Tool (${type}) using the Leaflet provider`);
			}
		}
	}
}
