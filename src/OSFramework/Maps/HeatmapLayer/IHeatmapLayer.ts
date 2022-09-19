// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace OSFramework.Maps.HeatmapLayer {
    export interface IHeatmapLayer
        extends Interface.IBuilder,
            Interface.ISearchById,
            Interface.IDisposable {
        config: Configuration.IConfigurationHeatmapLayer; //IConfigurationHeatmapLayer
        isReady: boolean;
        map: OSMap.IMap; //IMap
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        provider: any;
        uniqueId: string;
        widgetId: string;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        changeProperty(propertyName: string, propertyValue: any): void;
    }
}
