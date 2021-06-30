// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace OSFramework.Event.Marker {
    /**
     * Class that will be responsible for managing the events of the Markers.
     *
     * @export
     * @class MarkerEventsManager
     * @extends {AbstractEventsManager<MarkerEventType, string>}
     */
    export class MarkerEventsManager extends AbstractEventsManager<
        MarkerEventType,
        string
    > {
        private _marker: OSFramework.Marker.IMarker;

        constructor(marker: OSFramework.Marker.IMarker) {
            super();
            this._marker = marker;
        }

        protected getInstanceOfEventType(
            eventType: MarkerEventType
        ): OSFramework.Event.IEvent<string> {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            let event: OSFramework.Event.IEvent<string>;

            // The following events are being deprecated. They should get removed soon.
            switch (eventType) {
                case MarkerEventType.Initialized:
                    event = new MarkerInitializedEvent();
                    break;
                case MarkerEventType.OnClick:
                    event = new MarkerOnClickEvent();
                    break;
                case MarkerEventType.OnMouseout:
                    event = new MarkerOnMouseoutEvent();
                    break;
                case MarkerEventType.OnMouseover:
                    event = new MarkerOnMouseoverEvent();
                    break;
                case MarkerEventType.OnEventTriggered:
                    event = new MarkerOnEventTriggered();
                    break;
                default:
                    // Validate if google provider has this event before creating the instance of MarkerProviderEvent
                    if (
                        this._marker.validateProviderEvent(eventType) === true
                    ) {
                        event = new MarkerProviderEvent();
                        break;
                    }
                    throw `The event '${eventType}' is not supported in a Marker`;
            }
            return event;
        }

        /**
         * Trigger the specific events depending on the event type specified
         * @param eventType Type of the event currently supported in the Marker element.
         * @param value Value to be passed to OS in the type of a string.
         */
        public trigger(
            eventType: MarkerEventType,
            eventInfo?: string,
            // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
            ...args: any
        ): void {
            // Let's first check if the map has any events associated
            // If the event type is ProviderEvent than we need to get the handlers for the eventInfo -> name of the event
            // If the event type is not ProviderEvent than we need to get the handlers for the eventType (Initialized, OnError, OnEventTriggered)
            const hasEvents =
                eventType === MarkerEventType.ProviderEvent
                    ? this.handlers.has(eventInfo as MarkerEventType)
                    : this.handlers.has(eventType);
            if (hasEvents) {
                const handlerEvent = this.handlers.get(eventType);

                // The following events are being deprecated. They should get removed soon.
                switch (eventType) {
                    case MarkerEventType.Initialized:
                        handlerEvent.trigger(
                            this._marker.map.widgetId, // Id of Map block that was initialized
                            this._marker.widgetId || this._marker.uniqueId, // Id of Marker block that was initialized
                            this._marker.index // Index of Marker block that was initialized
                        );
                        break;
                    case MarkerEventType.OnClick:
                    case MarkerEventType.OnMouseout:
                    case MarkerEventType.OnMouseover:
                        handlerEvent.trigger(
                            this._marker.map.widgetId, // Id of Map block that was clicked
                            this._marker.widgetId || this._marker.uniqueId, // Id of Marker block that was clicked
                            this._marker.index // Index of Marker block that was clicked
                        );
                        break;
                    case MarkerEventType.OnEventTriggered:
                        handlerEvent.trigger(
                            this._marker.map.widgetId, // Id of Map block that triggered the event
                            this._marker.widgetId || this._marker.uniqueId, // Id of Marker block that triggered the event
                            this._marker.index, // Index of Marker block that triggered the event
                            eventInfo // Name of the event that got triggered
                        );
                        break;
                    case MarkerEventType.ProviderEvent:
                        // If the event type is ProviderEvent we need to first check if the event info (name of the event) is a valid one for the provider events
                        if (
                            this._marker.validateProviderEvent(eventInfo) ===
                            true
                        ) {
                            const handler = this.handlers.get(
                                eventInfo as MarkerEventType
                            );
                            handler.trigger(
                                this._marker.map.widgetId, // Id of Map block that triggered the event
                                this._marker.widgetId || this._marker.uniqueId, // Id of Marker block that triggered the event
                                eventInfo, // Name of the event that got triggered
                                ...args // Coordinates retrieved from the marker event that got triggered
                            );
                            break;
                        }
                    // If the event is not valid we can fall in the default case of the switch and throw an error
                    // eslint-disable-next-line no-fallthrough
                    default:
                        throw `The event '${eventType}' is not supported in a Marker`;
                }
            }
        }
    }
}
