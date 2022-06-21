///<reference path="AbstractDrawingToolsEvent.ts"/>

// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace OSFramework.Event.DrawingTools {
    /**
     * Class that represents the DrawingToolsProviderEvent event.
     *
     * @class DrawingToolsProviderEvent
     * @extends {AbstractEvent<string>}
     */
    export class DrawingToolsProviderEvent extends AbstractDrawingToolsEvent {
        /**
         * Method that will trigger the event with the correct parameters.
         * @param mapId Id of the Map that is raising the event
         * @param drawingToolsId Id of the DrawingTools that is raising the event
         * @param eventName Name of the event that got raised
         * @param isNewElement IsNewShape/IsNewMarker (empty if the provider event is not handled by the element creator or changer)
         */
        public trigger(
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            mapId: string,
            drawingToolsId: string,
            eventName: string,
            isNewElement: boolean,
            coordinates:
                | OSStructures.OSMap.Coordinates
                | OSStructures.OSMap.BoundsString,
            location: string
        ): void {
            this.handlers
                .slice(0)
                .forEach((h) =>
                    Helper.AsyncInvocation(
                        h,
                        mapId,
                        drawingToolsId,
                        eventName,
                        isNewElement,
                        coordinates,
                        location
                    )
                );
        }
    }
}
