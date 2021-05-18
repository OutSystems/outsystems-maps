// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace OSFramework.Marker {
    export interface IMarker
        extends Interface.IBuilder,
            Interface.ISearchById,
            Interface.IDisposable {
        config: Configuration.IConfigurationMarker; //IConfigurationMarker
        index: number;
        isReady: boolean;
        map: OSMap.IMap; //IMap
        markerEvents: Event.Marker.MarkerEventsManager;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
