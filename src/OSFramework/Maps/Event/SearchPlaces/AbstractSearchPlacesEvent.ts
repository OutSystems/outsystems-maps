// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace OSFramework.Event.SearchPlaces {
    /**
     * Class that will make sure that the trigger invokes the handlers
     * with the correct parameters.
     *
     * @abstract
     * @class AbstractShapeEvent
     * @extends {AbstractEvent<string>}
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    export abstract class AbstractSearchPlacesEvent extends AbstractEvent<OSFramework.SearchPlaces.ISearchPlaces> {
        // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
        public trigger(
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            searchPlacesObj: OSFramework.SearchPlaces.ISearchPlaces,
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
