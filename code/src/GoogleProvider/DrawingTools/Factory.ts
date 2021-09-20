// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace GoogleProvider.DrawingTools {
    export namespace DrawingToolsFactory {
        export function MakeDrawingTools(
            map: OSFramework.OSMap.IMap,
            drawingToolsId: string,
            configs: OSFramework.Configuration.IConfiguration
        ): OSFramework.DrawingTools.IDrawingTools {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            switch (type) {
                case OSFramework.Enum.DrawingToolsTypes.Marker:
                    return new DrawMarker(
                        map,
                        drawingTools,
                        toolId,
                        type,
                        configs as Configuration.DrawingTools.DrawMarkerConfig
                    );
                default:
                    throw `There is no factory for this type of DrawingTool (${type})`;
            }
        }
    }
}
