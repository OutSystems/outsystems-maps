// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace OSFramework.Maps.Marker {
    export interface IMarker
        extends Interface.IBuilder,
            Interface.ISearchById,
            Interface.IDisposable {
        config: Configuration.IConfigurationMarker; //IConfigurationMarker
        /** Returns True if the Marker has a popup (MarkerPopup) */
        hasPopup: boolean;
        index: number;
        isReady: boolean;
        map: OSMap.IMap; //IMap
        markerEvents: Event.Marker.MarkerEventsManager;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        provider: any;
        uniqueId: string;
        widgetId: string;

        build(): void;
        changeProperty(propertyName: string, propertyValue: unknown): void;
        dispose(): void;
        /**
         * Refreshes the Events of the Marker Provider after Subscribing/Unsubscribing events
         */
        refreshProviderEvents(): void;
        /**
         * Check if the event name is valid for the provider events
         * @param eventName name of the event from provider
         */
        validateProviderEvent(eventName: string): boolean;
    }
}
