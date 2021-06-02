// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace OSFramework.OSMap {
    export interface IMap
        extends Interface.IBuilder,
            Interface.ISearchById,
            Interface.IDisposable {
        /** Map configuration */
        config: Configuration.IConfigurationMap;
        /** Exposed features of the Map */
        features: OSFramework.Feature.ExposedFeatures;
        /** Boolean that indicates if the Map is ready */
        isReady: boolean;
        /** Events from the Map */
        mapEvents: Event.OSMap.MapEventsManager;
        /** Tag of the Map Block from OS */
        mapTag: string;
        /** Get all Markers from the Map */
        markers: Array<OSFramework.Marker.IMarker>;
        /** Map provider */
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        provider: any;
        /** Events from the Map provider */
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        providerEvents: any;
        /** Id of the Map */
        uniqueId: string;
        /** Id of the Map widget */
        widgetId: string;

        /**
         * Add new Marker to the Map
         * @param marker Marker that will be added to the Map
         * @returns Marker that has been created
         */
        addMarker(
            marker: OSFramework.Marker.IMarker
        ): OSFramework.Marker.IMarker;
        /**
         * Change property of a marker from the Map by specifying the property name and the new value
         * @param markerId id of the Marker
         * @param propertyName name of the property
         * @param propertyValue new value of the property
         */
        changeMarkerProperty(
            markerId: string,
            propertyName: string,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            propertyValue: any
        ): void;
        /**
         * Change property of the Map by specifying the property name and the new value
         * @param propertyName name of the property
         * @param propertyValue new value of the property
         */
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        changeProperty(propertyName: string, propertyValue: any): void;
        /**
         * Get the Marker from the Map by giving a markerId
         * @param markerId id of the marker
         * @returns Marker found via the specified markerId
         */
        getMarker(markerId: string): OSFramework.Marker.IMarker;
        /**
         * Checks if the Map has a specific Marker by giving a markerId
         * @param markerId id of the marker
         */
        hasMarker(markerId: string): boolean;
        /**
         * Checks if the Map has any Marker defined
         */
        hasMarkersDefined(): boolean;
        /**
         * Refreshes the Map after changing zoom or center.
         * Can be used to reset to the defined zoom, center and offset configurations.
         */
        refresh(): void;
        /**
         * Refreshes the Events of the Map Provider after Subscribing/Unsubscribing events
         */
        refreshProviderEvents(): void;
        /**
         * Remove all Markers from the Map
         */
        removeAllMarkers(): void;
        /**
         * Remove a Marker from the Map by giving a markerId
         * @param markerId id of the marker
         */
        removeMarker(markerId: string): void;
        /**
         * Check if the event name is valid for the provider events
         * @param eventName name of the event from provider
         */
        validateProviderEvent(eventName: string): boolean;
    }
}
