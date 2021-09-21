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
        // FileLayerEvents: Event.FileLayer.FileLayerEventsManager;
        isReady: boolean;
        map: OSMap.IMap; //IMap
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        provider: any;
        /** Events from the FileLayer provider */
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        // providerEvents: any;
        uniqueId: string;
        widgetId: string;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        changeProperty(propertyName: string, propertyValue: any): void;
        /**
         * Refreshes the Events of the FileLayer Provider after Subscribing/Unsubscribing events
         */
        // refreshProviderEvents(): void;
        /**
         * Check if the event name is valid for the provider events
         * @param eventName name of the event from provider
         */
        validateProviderEvent(eventName: string): boolean;
    }
}
