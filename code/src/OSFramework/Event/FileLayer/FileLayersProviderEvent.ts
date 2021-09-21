///<reference path="AbstractFileLayersEvent.ts"/>

// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace OSFramework.Event.FileLayer {
    /**
     * Class that represents the FileLayersProviderEvent event.
     *
     * @class FileLayersProviderEvent
     * @extends {AbstractEvent<string>}
     */
    export class FileLayersProviderEvent extends AbstractFileLayersEvent {
        /**
         * Method that will trigger the event with the correct parameters.
         * @param mapId Id of the Map that is raising the event
         * @param fileLayersId Id of the FileLayers that is raising the event
         * @param eventName Name of the event that got raised
         * @param isNewElement IsNewShape/IsNewMarker (empty if the provider event is not handled by the element creator or changer)
         */
        public trigger(
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            mapId: string,
            fileLayersId: string,
            eventName: string,
            isNewElement: boolean
        ): void {
            this.handlers
                .slice(0)
                .forEach((h) =>
                    h(mapId, fileLayersId, eventName, isNewElement)
                );
        }
    }
}
