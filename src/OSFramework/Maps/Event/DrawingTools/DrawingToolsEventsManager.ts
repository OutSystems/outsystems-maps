// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace OSFramework.Maps.Event.DrawingTools {
    /**
     * Class that will be responsible for managing the events of the DrawingTools.
     *
     * @export
     * @class DrawingToolsEventsManager
     * @extends {AbstractEventsManager<DrawingToolsEventType, string>}
     */
    export class DrawingToolsEventsManager extends AbstractEventsManager<
        DrawingToolsEventType,
        string
    > {
        private _drawingTools: OSFramework.Maps.DrawingTools.IDrawingTools;

        constructor(drawingTools: OSFramework.Maps.DrawingTools.IDrawingTools) {
            super();
            this._drawingTools = drawingTools;
        }

        protected getInstanceOfEventType(
            eventType: DrawingToolsEventType
        ): OSFramework.Maps.Event.IEvent<string> {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            let event: OSFramework.Maps.Event.IEvent<string>;

            switch (eventType) {
                case DrawingToolsEventType.Initialized:
                    event = new DrawingToolsInitializedEvent();
                    break;
                default:
                    // Validate if google provider has this event before creating the instance of DrawingToolsProviderEvent
                    if (
                        this._drawingTools.validateProviderEvent(eventType) ===
                        true
                    ) {
                        event = new DrawingToolsProviderEvent();
                        break;
                    }
                    this._drawingTools.map.mapEvents.trigger(
                        OSMap.MapEventType.OnError,
                        this._drawingTools.map,
                        Enum.ErrorCodes.GEN_UnsupportedEventDrawingTools,
                        `${eventType}`
                    );
                    return;
            }
            return event;
        }

        /**
         * Trigger the specific events depending on the event type specified
         * @param eventType Type of the event currently supported in the DrawingTools element.
         * @param value Value to be passed to OS in the type of a string.
         */
        public trigger(
            eventType: DrawingToolsEventType,
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            eventInfo?: string,
            // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
            ...args: any
        ): void {
            // Let's first check if the DrawingTools has any events associated
            // If the event type is ProviderEvent than we need to get the handlers for the eventInfo -> name of the event
            // If the event type is not ProviderEvent than we need to get the handlers for the eventType (Initialized, OnError, OnEventTriggered)
            const hasEvents =
                eventType === DrawingToolsEventType.ProviderEvent
                    ? this.handlers.has(eventInfo as DrawingToolsEventType)
                    : this.handlers.has(eventType);
            if (hasEvents) {
                const handlerEvent = this.handlers.get(eventType);

                switch (eventType) {
                    case DrawingToolsEventType.Initialized:
                        handlerEvent.trigger(
                            this._drawingTools.map.widgetId, // Id of Map block that was initialized
                            this._drawingTools.widgetId ||
                                this._drawingTools.uniqueId // Id of DrawingTools block that was initialized
                        );
                        break;
                    case DrawingToolsEventType.ProviderEvent:
                        // If the event type is ProviderEvent we need to first check if the event info (name of the event) is a valid one for the provider events
                        if (
                            this._drawingTools.validateProviderEvent(
                                eventInfo
                            ) === true
                        ) {
                            const handler = this.handlers.get(
                                eventInfo as DrawingToolsEventType
                            );
                            handler.trigger(
                                this._drawingTools.map.widgetId, // Id of Map block that triggered the event
                                args[0].uniqueId ||
                                    this._drawingTools.widgetId ||
                                    this._drawingTools.uniqueId, // Id of marker/shape block (once created by the DrawingTools) that triggered the event
                                // eventInfo, // Name of the event that got triggered
                                args[0].isNewElement, // IsNewShape/IsNewMarker default is true
                                args[0].coordinates, // coordinates in lat/lng structure
                                args[0].location // location in string, as the shape block accepts coords and addresses
                            );
                            break;
                        }
                    // If the event is not valid we can fall in the default case of the switch and throw an error
                    // eslint-disable-next-line no-fallthrough
                    default:
                        this._drawingTools.map.mapEvents.trigger(
                            OSMap.MapEventType.OnError,
                            this._drawingTools.map,
                            Enum.ErrorCodes.GEN_UnsupportedEventDrawingTools,
                            `${eventType}`
                        );
                        return;
                }
            }
        }
    }
}
