// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace OSFramework.DrawingTools {
    export namespace DrawingToolsFactory {
        export function MakeDrawingTools(
            map: OSMap.IMap,
            drawingToolsId: string,
            configs: Configuration.IConfiguration
        ): DrawingTools.IDrawingTools {
            switch (map.providerType) {
                case Enum.ProviderType.Google:
                    return GoogleProvider.DrawingTools.DrawingToolsFactory.MakeDrawingTools(
                        map,
                        drawingToolsId,
                        configs
                    );
                case Enum.ProviderType.Leaflet:
                    return LeafletProvider.DrawingTools.DrawingToolsFactory.MakeDrawingTools(
                        map,
                        drawingToolsId,
                        configs
                    );
                default:
                    throw `There is no factory for the DrawingTools using the provider ${map.providerType}`;
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
                    return GoogleProvider.DrawingTools.DrawingToolsFactory.MakeTool(
                        map,
                        drawingTools,
                        toolId,
                        type,
                        configs
                    );
                case Enum.ProviderType.Leaflet:
                    return LeafletProvider.DrawingTools.DrawingToolsFactory.MakeTool(
                        map,
                        drawingTools,
                        toolId,
                        type,
                        configs
                    );
                default:
                    throw `There is no factory for the Tool (${type}) using the provider ${map.providerType}`;
            }
        }
    }
}
