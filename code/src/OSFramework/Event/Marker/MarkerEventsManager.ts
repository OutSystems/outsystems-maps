// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace OSFramework.Event.Marker {
    /**
     * Class that will be responsible for managing the events of the Markers.
     *
     * @export
     * @class MarkerEventsManager
     * @extends {AbstractEventsManager<MarkerEventType, OSFramework.Marker.IMarker>}
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
        ): IEvent<string> {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            let event: OSFramework.Event.IEvent<string>;

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
                    throw `The event '${eventType}' is not supported in a Marker`;
                    break;
            }
            return event;
        }

        /**
         * Trigger the specific events depending on the event type specified
         * @param eventType Type of the event currently supported in the Marker element.
         * @param value Value to be passed to OS in the type of a string.
         */
        public trigger(eventType: MarkerEventType, eventName?: string): void {
            if (this.handlers.has(eventType)) {
                const handlerEvent = this.handlers.get(eventType);

                switch (eventType) {
                    case MarkerEventType.Initialized:
                        handlerEvent.trigger(
                            this._marker.map.widgetId, // Id of Map block that was initialized
                            this._marker.uniqueId, // Id of Marker block that was initialized
                            this._marker.index // Index of Marker block that was initialized
                        );
                        break;
                    case MarkerEventType.OnClick:
                    case MarkerEventType.OnMouseout:
                    case MarkerEventType.OnMouseover:
                        handlerEvent.trigger(
                            this._marker.map.widgetId, // Id of Map block that was clicked
                            this._marker.uniqueId, // Id of Marker block that was clicked
                            this._marker.index // Index of Marker block that was clicked
                        );
                        break;
                    case MarkerEventType.OnEventTriggered:
                        handlerEvent.trigger(
                            this._marker.map.widgetId, // Id of Map block that was clicked.
                            this._marker.uniqueId, // Id of Marker block that was clicked.
                            this._marker.index, // Index of Marker block that was clicked
                            eventName // Name of the event that got triggered
                        );
                        break;
                    default:
                        throw `The event '${eventType}' is not supported in a Marker`;
                        break;
                }
            }
        }
    }
}
