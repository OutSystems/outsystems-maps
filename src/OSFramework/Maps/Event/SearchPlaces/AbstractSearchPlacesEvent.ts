// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace OSFramework.Maps.Event.SearchPlaces {
    /**
     * Class that will make sure that the trigger invokes the handlers
     * with the correct parameters.
     *
     * @abstract
     * @class AbstractShapeEvent
     * @extends {AbstractEvent<string>}
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    export abstract class AbstractSearchPlacesEvent extends AbstractEvent<OSFramework.Maps.SearchPlaces.ISearchPlaces> {
        // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
        public trigger(
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            searchPlacesObj: OSFramework.Maps.SearchPlaces.ISearchPlaces,
            searchPlacesId: string,
            ...args: unknown[]
        ): void {
            this.handlers
                .slice(0)
                .forEach((h) =>
                    Helper.CallbackAsyncInvocation(
                        h.eventHandler,
                        searchPlacesObj,
                        searchPlacesId,
                        ...args
                    )
                );
        }
    }
}
