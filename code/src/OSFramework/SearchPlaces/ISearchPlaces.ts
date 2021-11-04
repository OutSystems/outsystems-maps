// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace OSFramework.SearchPlaces {
    export interface ISearchPlaces
        extends Interface.IBuilder,
            Interface.ISearchById,
            Interface.IDisposable {
        config: Configuration.IConfigurationSearchPlaces; //IConfigurationSearchPlaces
        isReady: boolean;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        provider: any;
        /** Events from the Map */
        searchPlacesEvents: Event.SearchPlaces.SearchPlacesEventsManager;
        uniqueId: string;
        widgetId: string;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        changeProperty(propertyName: string, propertyValue: any): void;
    }
}
