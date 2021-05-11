// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace OSFramework.Event.OSMap {
    /**
     * Class that will be responsible for managing the events of the Map.
     *
     * @export
     * @class MapEventsManager
     * @extends {AbstractEventsManager<MapEventType, string>}
     */
    export class MapEventsManager extends AbstractEventsManager<
        MapEventType,
        string
    > {
        private _map: OSFramework.OSMap.IMap;

        constructor(map: OSFramework.OSMap.IMap) {
            super();
            this._map = map;
        }

        protected getInstanceOfEventType(
            eventType: MapEventType
        ): OSFramework.Event.IEvent<string> {
            let event: OSFramework.Event.IEvent<string>;

            switch (eventType) {
                case MapEventType.Initialized:
                    event = new MapInitializedEvent();
                    break;
                case MapEventType.OnEventTriggered:
                    event = new MapOnEventTriggered();
                    break;
                default:
                    throw `The event '${eventType}' is not supported in a Map`;
                    break;
            }
            return event;
        }

        public addHandler(
            eventType: MapEventType,
            handler: OSFramework.Callbacks.OSMap.Event
        ): void {
            //if the Map is already ready, fire immediatly the event.
            if (eventType === MapEventType.Initialized && this._map.isReady) {
                //make the invocation of the handler assync.
                setTimeout(() => handler(this._map.widgetId, this._map), 0);
            } else {
                super.addHandler(eventType, handler);
            }
        }

        /**
         * Trigger the specific events depending on the event type specified
         * @param eventType Type of the event currently supported in the Map element.
         */
        public trigger(eventType: MapEventType, eventName?: string): void {
            if (this.handlers.has(eventType)) {
                const handlerEvent = this.handlers.get(eventType);

                switch (eventType) {
                    case MapEventType.Initialized:
                        handlerEvent.trigger(this._map.widgetId);
                        break;
                    case MapEventType.OnEventTriggered:
                        handlerEvent.trigger(
                            this._map.widgetId, // Id of Map block that was clicked.
                            eventName
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
