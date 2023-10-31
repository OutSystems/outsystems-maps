// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace OSFramework.Maps.FileLayer {
    export interface IFileLayer
        extends Interface.IBuilder,
            Interface.ISearchById,
            Interface.IDisposable {
        config: Configuration.IConfigurationFileLayer; //IConfigurationFileLayer
        createdElements: Array<unknown>;
        /** Events from the FileLayer */
        fileLayerEvents: Event.FileLayer.FileLayersEventsManager;
        isReady: boolean;
        map: OSMap.IMap; //IMap
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        provider: any;
        uniqueId: string;
        widgetId: string;

        changeProperty(propertyName: string, propertyValue: unknown): void;
        /**
         * Refreshes the Events of the FileLayer Provider after Subscribing/Unsubscribing events
         */
        refreshProviderEvents(): void;
    }
}
