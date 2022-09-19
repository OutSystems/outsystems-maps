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
            // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
            ...args: any
        ): void {
            this.handlers
                .slice(0)
                .forEach((h) =>
                    Helper.CallbackAsyncInvocation(
                        h,
                        searchPlacesObj,
                        searchPlacesId,
                        ...args
                    )
                );
        }
    }
}
