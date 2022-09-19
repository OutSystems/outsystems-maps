///<reference path="AbstractMarkerEvent.ts"/>

// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace OSFramework.Maps.Event.Marker {
    /**
     * Class that represents the MarkerProviderEvent event.
     *
     * @class MapProviderEvent
     * @extends {AbstractEvent<string>}
     */
    export class MarkerProviderEvent extends AbstractMarkerEvent {
        /**
         * Method that will trigger the event with the correct parameters.
         * @param mapId Id of the Map that is raising the event
         * @param markerId Id of the Marker that is raising the event
         * @param eventName Name of the event that got raised
         * @param coords Stringified object containing both Lat and Lng from the event (can be empty)
         */
        public trigger(
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            mapId: string,
            markerId: string,
            eventName: string,
            coords: string
        ): void {
            this.handlers
                .slice(0)
                .forEach((h) =>
                    Helper.CallbackAsyncInvocation(
                        h,
                        mapId,
                        markerId,
                        eventName,
                        coords
                    )
                );
        }
    }
}
