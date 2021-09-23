// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace OSFramework.FileLayer {
    export interface IFileLayer
        extends Interface.IBuilder,
            Interface.ISearchById,
            Interface.IDisposable {
        config: Configuration.IConfigurationFileLayer; //IConfigurationFileLayer
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        createdElements: Array<any>;
        /** Events from the FileLayer */
        fileLayerEvents: Event.FileLayer.FileLayersEventsManager;
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
