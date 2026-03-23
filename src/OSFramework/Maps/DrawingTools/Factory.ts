// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace OSFramework.Maps.DrawingTools {
	export namespace DrawingToolsFactory {
		export function MakeDrawingTools(
			map: OSMap.IMap,
			drawingToolsId: string,
			configs: JSON,
			useTerraDraw: boolean = true
		): IDrawingTools {
			let drawingToolsBuilder: OSFramework.Maps.Callbacks.Generic;

			switch (map.providerType) {
				case Enum.ProviderType.Google:
					if (useTerraDraw) {
						drawingToolsBuilder = Provider.DrawingTools.TerraDraw.DrawingToolsFactory.MakeDrawingTools;
					} else {
						drawingToolsBuilder = Provider.Maps.Google.DrawingTools.DrawingToolsFactory.MakeDrawingTools;
					}
					break;
				case Enum.ProviderType.Leaflet:
					drawingToolsBuilder = Provider.Maps.Leaflet.DrawingTools.DrawingToolsFactory.MakeDrawingTools;
					break;
				default:
					throw new Error(`There is no factory for the DrawingTools using the provider ${map.providerType}`);
			}

			return drawingToolsBuilder(map, drawingToolsId, configs) as IDrawingTools;
		}

		export function MakeTool(
			map: OSMap.IMap,
			drawingTools: DrawingTools.IDrawingTools,
			toolId: string,
			type: Enum.DrawingToolsTypes,
			configs: JSON,
			useTerraDraw: boolean = true
		): ITool {
			let toolBuilder: OSFramework.Maps.Callbacks.Generic;

			switch (map.providerType) {
				case Enum.ProviderType.Google:
					if (useTerraDraw) {
						toolBuilder = Provider.DrawingTools.TerraDraw.DrawingToolsFactory.MakeTool;
					} else {
						toolBuilder = Provider.Maps.Google.DrawingTools.DrawingToolsFactory.MakeTool;
					}
					break;
				case Enum.ProviderType.Leaflet:
					toolBuilder = Provider.Maps.Leaflet.DrawingTools.DrawingToolsFactory.MakeTool;
					break;
				default:
					throw new Error(
						`There is no factory for the Tool (${type}) using the provider ${map.providerType}`
					);
			}

			return toolBuilder(map, drawingTools, toolId, type, configs) as ITool;
		}
	}
}
