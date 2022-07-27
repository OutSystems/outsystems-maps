///<reference path="AbstractShapeEvent.ts"/>

// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace OSFramework.Event.Shape {
    /**
     * Class that represents the ShapeProviderEvent event.
     *
     * @class ShapeProviderEvent
     * @extends {AbstractEvent<string>}
     */
    export class ShapeProviderEvent extends AbstractShapeEvent {
        /**
         * Method that will trigger the event with the correct parameters.
         * @param mapId Id of the Map that is raising the event
         * @param shapeId Id of the Shape that is raising the event
         * @param eventName Name of the event that got raised
         */
        public trigger(
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            mapId: string,
            shapeId: string,
            eventName: string
        ): void {
            this.handlers
                .slice(0)
                .forEach((h) =>
                    Helper.CallbackAsyncInvocation(h, mapId, shapeId, eventName)
                );
        }
    }
}
