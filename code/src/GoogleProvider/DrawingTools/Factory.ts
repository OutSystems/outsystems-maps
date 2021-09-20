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
    }
}
