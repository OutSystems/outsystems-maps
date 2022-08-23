// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace Provider.Maps.Leaflet.DrawingTools {
    export namespace DrawingToolsFactory {
        export function MakeDrawingTools(
            map: OSFramework.Maps.OSMap.IMap,
            drawingToolsId: string,
            configs: OSFramework.Maps.Configuration.IConfiguration
        ): OSFramework.Maps.DrawingTools.IDrawingTools {
            return new DrawingTools(
                map,
                drawingToolsId,
                configs as Configuration.DrawingTools.DrawingToolsConfig
            );
        }

        export function MakeTool(
            map: OSFramework.Maps.OSMap.IMap,
            drawingTools: OSFramework.Maps.DrawingTools.IDrawingTools,
            toolId: string,
            type: OSFramework.Maps.Enum.DrawingToolsTypes,
            configs: OSFramework.Maps.Configuration.IConfiguration
        ): OSFramework.Maps.DrawingTools.ITool {
            switch (type) {
                case OSFramework.Maps.Enum.DrawingToolsTypes.Marker:
                    return new DrawMarker(
                        map,
                        drawingTools,
                        toolId,
                        type,
                        configs as Configuration.DrawingTools.DrawMarkerConfig
                    );
                case OSFramework.Maps.Enum.DrawingToolsTypes.Polyline:
                    return new DrawPolyline(
                        map,
                        drawingTools,
                        toolId,
                        type,
                        configs as Configuration.DrawingTools.DrawBasicShapeConfig
                    );
                case OSFramework.Maps.Enum.DrawingToolsTypes.Polygon:
                    return new DrawPolygon(
                        map,
                        drawingTools,
                        toolId,
                        type,
                        configs as Configuration.DrawingTools.DrawFilledShapeConfig
                    );
                case OSFramework.Maps.Enum.DrawingToolsTypes.Circle:
                    return new DrawCircle(
                        map,
                        drawingTools,
                        toolId,
                        type,
                        configs as Configuration.DrawingTools.DrawFilledShapeConfig
                    );
                case OSFramework.Maps.Enum.DrawingToolsTypes.Rectangle:
                    return new DrawRectangle(
                        map,
                        drawingTools,
                        toolId,
                        type,
                        configs as Configuration.DrawingTools.DrawFilledShapeConfig
                    );
                default:
                    throw new Error(
                        `There is no factory for this type of Tool (${type}) using the Leaflet provider`
                    );
            }
        }
    }
}
