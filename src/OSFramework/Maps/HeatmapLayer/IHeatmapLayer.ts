// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace OSFramework.Maps.HeatmapLayer {
	export interface IHeatmapLayer extends Interface.IBuilder, Interface.ISearchById, Interface.IDisposable {
		config: Configuration.IConfigurationHeatmapLayer;
		isReady: boolean;
		map: OSMap.IMap;
		provider: unknown;
		uniqueId: string;
		widgetId: string;

		changeProperty(propertyName: string, propertyValue: unknown): void;
	}
}
