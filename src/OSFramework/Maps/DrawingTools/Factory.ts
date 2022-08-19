// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace OSFramework.Maps.DrawingTools {
    export namespace DrawingToolsFactory {
        export function MakeDrawingTools(
            map: OSMap.IMap,
            drawingToolsId: string,
            configs: Configuration.IConfiguration
        ): DrawingTools.IDrawingTools {
            switch (map.providerType) {
                case Enum.ProviderType.Google:
                    return Provider.Google.DrawingTools.DrawingToolsFactory.MakeDrawingTools(
                        map,
                        drawingToolsId,
                        configs
                    );
                case Enum.ProviderType.Leaflet:
                    return Provider.Leaflet.DrawingTools.DrawingToolsFactory.MakeDrawingTools(
                        map,
                        drawingToolsId,
                        configs
                    );
                default:
                    throw new Error(
                        `There is no factory for the DrawingTools using the provider ${map.providerType}`
                    );
            }
        }

        export function MakeTool(
            map: OSMap.IMap,
            drawingTools: DrawingTools.IDrawingTools,
            toolId: string,
            type: Enum.DrawingToolsTypes,
            configs: Configuration.IConfiguration
        ): DrawingTools.ITool {
            switch (map.providerType) {
                case Enum.ProviderType.Google:
                    return Provider.Google.DrawingTools.DrawingToolsFactory.MakeTool(
                        map,
                        drawingTools,
                        toolId,
                        type,
                        configs
                    );
                case Enum.ProviderType.Leaflet:
                    return Provider.Leaflet.DrawingTools.DrawingToolsFactory.MakeTool(
                        map,
                        drawingTools,
                        toolId,
                        type,
                        configs
                    );
                default:
                    throw new Error(
                        `There is no factory for the Tool (${type}) using the provider ${map.providerType}`
                    );
            }
        }
    }
}
