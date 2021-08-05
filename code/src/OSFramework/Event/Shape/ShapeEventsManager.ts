// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace OSFramework.Event.Shape {
    /**
     * Class that will be responsible for managing the events of the Shapes.
     *
     * @export
     * @class ShapeEventsManager
     * @extends {AbstractEventsManager<ShapeEventType, string>}
     */
    export class ShapeEventsManager extends AbstractEventsManager<
        ShapeEventType,
        string
    > {
        private _shape: OSFramework.Shape.IShape;

        constructor(shape: OSFramework.Shape.IShape) {
            super();
            this._shape = shape;
        }

        protected getInstanceOfEventType(
            eventType: ShapeEventType
        ): OSFramework.Event.IEvent<string> {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            let event: OSFramework.Event.IEvent<string>;

            switch (eventType) {
                case ShapeEventType.Initialized:
                    event = new ShapeInitializedEvent();
                    break;
                case ShapeEventType.OnClick:
                    event = new ShapeOnClickEvent();
                    break;
                default:
                    this._shape.map.mapEvents.trigger(
                        OSMap.MapEventType.OnError,
                        this._shape.map,
                        Enum.ErrorCodes.GEN_UnsupportedEventMarker,
                        `${eventType}`
                    );
                    return;
            }
            return event;
        }

        /**
         * Trigger the specific events depending on the event type specified
         * @param eventType Type of the event currently supported in the Shape element.
         * @param value Value to be passed to OS in the type of a string.
         */
        public trigger(
            eventType: ShapeEventType,
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            eventInfo?: string,
            // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
            ...args: any
        ): void {
            // Let's first check if the shape has any events associated
            // If the event type is ProviderEvent than we need to get the handlers for the eventInfo -> name of the event
            // If the event type is not ProviderEvent than we need to get the handlers for the eventType (Initialized, OnError, OnEventTriggered)
            const hasEvents = this.handlers.has(eventType);
            if (hasEvents) {
                const handlerEvent = this.handlers.get(eventType);

                switch (eventType) {
                    case ShapeEventType.Initialized:
                        handlerEvent.trigger(
                            this._shape.map.widgetId, // Id of Map block that was initialized
                            this._shape.widgetId || this._shape.uniqueId, // Id of Shape block that was initialized
                            this._shape.index // Index of Shape block that was initialized
                        );
                        break;
                    case ShapeEventType.OnClick:
                        handlerEvent.trigger(
                            this._shape.map.widgetId, // Id of Map block that was clicked
                            this._shape.widgetId || this._shape.uniqueId, // Id of Shape block that was clicked
                            this._shape.index // Index of Shape block that was clicked
                        );
                        break;
                    // If the event is not valid we can fall in the default case of the switch and throw an error
                    // eslint-disable-next-line no-fallthrough
                    default:
                        this._shape.map.mapEvents.trigger(
                            OSMap.MapEventType.OnError,
                            this._shape.map,
                            Enum.ErrorCodes.GEN_UnsupportedEventMarker,
                            `${eventType}`
                        );
                        return;
                }
            }
        }
    }
}
