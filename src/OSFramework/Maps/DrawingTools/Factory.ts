// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace OSFramework.Maps.DrawingTools {
    export namespace DrawingToolsFactory {
        export function MakeDrawingTools(
            map: OSMap.IMap,
            drawingToolsId: string,
            configs: JSON
        ): DrawingTools.IDrawingTools {
            switch (map.providerType) {
                case Enum.ProviderType.Google:
                    return Provider.Maps.Google.DrawingTools.DrawingToolsFactory.MakeDrawingTools(
                        map,
                        drawingToolsId,
                        configs
                    );
                case Enum.ProviderType.Leaflet:
                    return Provider.Maps.Leaflet.DrawingTools.DrawingToolsFactory.MakeDrawingTools(
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
            configs: JSON
        ): DrawingTools.ITool {
            switch (map.providerType) {
                case Enum.ProviderType.Google:
                    return Provider.Maps.Google.DrawingTools.DrawingToolsFactory.MakeTool(
                        map,
                        drawingTools,
                        toolId,
                        type,
                        configs
                    );
                case Enum.ProviderType.Leaflet:
                    return Provider.Maps.Leaflet.DrawingTools.DrawingToolsFactory.MakeTool(
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
