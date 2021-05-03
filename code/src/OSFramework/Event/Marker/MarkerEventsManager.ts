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
        OSFramework.Marker.IMarker
    > {
        private _marker: OSFramework.Marker.IMarker;

        constructor(marker: OSFramework.Marker.IMarker) {
            super();
            this._marker = marker;
        }

        protected getInstanceOfEventType(
            eventType: MarkerEventType
        ): OSFramework.Event.IEvent<OSFramework.Marker.IMarker> {
            let event: OSFramework.Event.IEvent<OSFramework.Marker.IMarker>;

            switch (eventType) {
                case MarkerEventType.OnClick:
                    event = new MarkerOnClickEvent();
                    break;
                case MarkerEventType.OnMouseout:
                    event = new MarkerOnMouseoutEvent();
                    break;
                case MarkerEventType.OnMouseover:
                    event = new MarkerOnMouseoverEvent();
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
        public trigger(
            event: MarkerEventType,
            markerObj: OSFramework.Marker.IMarker,
            // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
            ...args
        ): void {
            if (this.handlers.has(event)) {
                this.handlers
                    .get(event)
                    .trigger(markerObj, markerObj.widgetId, ...args);
            }
        }
    }
}
