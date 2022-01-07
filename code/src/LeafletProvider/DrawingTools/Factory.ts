// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace LeafletProvider.DrawingTools {
    export namespace DrawingToolsFactory {
        export function MakeDrawingTools(
            map: OSFramework.OSMap.IMap,
            drawingToolsId: string,
            configs: OSFramework.Configuration.IConfiguration
        ): OSFramework.DrawingTools.IDrawingTools {
            return new DrawingTools(
                map,
                drawingToolsId,
                configs as Configuration.DrawingTools.DrawingToolsConfig
            );
        }

        export function MakeTool(
            map: OSFramework.OSMap.IMap,
            drawingTools: OSFramework.DrawingTools.IDrawingTools,
            toolId: string,
            type: OSFramework.Enum.DrawingToolsTypes,
            configs: OSFramework.Configuration.IConfiguration
        ): OSFramework.DrawingTools.ITool {
            switch (type) {
                case OSFramework.Enum.DrawingToolsTypes.Marker:
                    return new DrawMarker(
                        map,
                        drawingTools,
                        toolId,
                        type,
                        configs as Configuration.DrawingTools.DrawMarkerConfig
                    );
                case OSFramework.Enum.DrawingToolsTypes.Polyline:
                    return new DrawPolyline(
                        map,
                        drawingTools,
                        toolId,
                        type,
                        configs as Configuration.DrawingTools.DrawBasicShapeConfig
                    );
                case OSFramework.Enum.DrawingToolsTypes.Polygon:
                    return new DrawPolygon(
                        map,
                        drawingTools,
                        toolId,
                        type,
                        configs as Configuration.DrawingTools.DrawFilledShapeConfig
                    );
                case OSFramework.Enum.DrawingToolsTypes.Circle:
                    return new DrawCircle(
                        map,
                        drawingTools,
                        toolId,
                        type,
                        configs as Configuration.DrawingTools.DrawFilledShapeConfig
                    );
                case OSFramework.Enum.DrawingToolsTypes.Rectangle:
                    return new DrawRectangle(
                        map,
                        drawingTools,
                        toolId,
                        type,
                        configs as Configuration.DrawingTools.DrawFilledShapeConfig
                    );
                default:
                    throw `There is no factory for this type of Tool (${type})`;
            }
        }
    }
}
