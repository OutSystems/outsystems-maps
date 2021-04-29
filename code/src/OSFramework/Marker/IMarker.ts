namespace OSFramework.Marker {
    export interface IMarker extends Interface.IBuilder, Interface.ISearchById, Interface.IDisposable {
        config: OSFramework.Configuration.IConfigurationMarker; //IConfigurationMarker
        isReady: boolean;
        map: any; //IMap
        markerEvents: Event.Marker.MarkerEventsManager;
        provider: any;
        uniqueId: string;
        widgetId: string;

        applyConfigs(): void;
        build(): void;
        changeProperty(propertyName: string, propertyValue: any): void;
        dispose(): void;
        getProviderConfig(): any;
        refresh(): void;
    }
}
