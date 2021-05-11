namespace OSFramework.Marker {
    export interface IMarker
        extends Interface.IBuilder,
            Interface.ISearchById,
            Interface.IDisposable {
        config: Configuration.IConfigurationMarker; //IConfigurationMarker
        isReady: boolean;
        map: any; //IMap
        markerEvents: Event.Marker.MarkerEventsManager;
        provider: any;
        uniqueId: string;
        widgetId: string;

        build(): void;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        changeProperty(propertyName: string, propertyValue: any): void;
        dispose(): void;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        getProviderConfig(): any;
    }
}
