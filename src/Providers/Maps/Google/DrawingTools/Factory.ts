// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace Provider.Maps.Google.DrawingTools {
    export namespace DrawingToolsFactory {
        export function MakeDrawingTools(
            map: OSFramework.Maps.OSMap.IMap,
            drawingToolsId: string,
            configs: JSON
        ): OSFramework.Maps.DrawingTools.IDrawingTools {
            return new DrawingTools(map, drawingToolsId, configs);
        }

        export function MakeTool(
            map: OSFramework.Maps.OSMap.IMap,
            drawingTools: OSFramework.Maps.DrawingTools.IDrawingTools,
            toolId: string,
            type: OSFramework.Maps.Enum.DrawingToolsTypes,
            configs: JSON
        ): OSFramework.Maps.DrawingTools.ITool {
            switch (type) {
                case OSFramework.Maps.Enum.DrawingToolsTypes.Marker:
                    return new DrawMarker(
                        map,
                        drawingTools,
                        toolId,
                        type,
                        configs
                    );
                case OSFramework.Maps.Enum.DrawingToolsTypes.Polyline:
                    return new DrawPolyline(
                        map,
                        drawingTools,
                        toolId,
                        type,
                        configs
                    );
                case OSFramework.Maps.Enum.DrawingToolsTypes.Polygon:
                    return new DrawPolygon(
                        map,
                        drawingTools,
                        toolId,
                        type,
                        configs
                    );
                case OSFramework.Maps.Enum.DrawingToolsTypes.Circle:
                    return new DrawCircle(
                        map,
                        drawingTools,
                        toolId,
                        type,
                        configs
                    );
                case OSFramework.Maps.Enum.DrawingToolsTypes.Rectangle:
                    return new DrawRectangle(
                        map,
                        drawingTools,
                        toolId,
                        type,
                        configs
                    );
                default:
                    throw new Error(
                        `There is no factory for this type of DrawingTool (${type})`
                    );
            }
        }
    }
}
