///<reference path="../AbstractEventsManager.ts"/>

// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace OSFramework.Event.OSMap {
    /**
     * Class that will be responsible for managing the events of the Map.
     *
     * @export
     * @class MapEventsManager
     * @extends {AbstractEventsManager<MapEventType, OSFramework.OSMap.IMap>}
     */
    export class MapEventsManager extends AbstractEventsManager<
        MapEventType,
        OSFramework.OSMap.IMap
    > {
        private _map: OSFramework.OSMap.IMap;

        constructor(map: OSFramework.OSMap.IMap) {
            super();
            this._map = map;
        }

        protected getInstanceOfEventType(
            eventType: MapEventType
        ): OSFramework.Event.IEvent<OSFramework.OSMap.IMap> {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            let event: OSFramework.Event.IEvent<OSFramework.OSMap.IMap>;

            switch (eventType) {
                case MapEventType.Initialized:
                    event = new MapInitializedEvent();
                    break;
                case MapEventType.OnError:
                    event = new MapOnError();
                    break;
                // OnEventTriggered is being deprecated, should be deleted soon
                case MapEventType.OnEventTriggered:
                    event = new MapOnEventTriggered();
                    break;
                default:
                    // Validate if google provider has this event before creating the instance of MapProviderEvent
                    if (this._map.validateProviderEvent(eventType) === true) {
                        event = new MapProviderEvent();
                        break;
                    }
                    throw `The event '${eventType}' is not supported in a Map`;
            }
            return event;
        }

        public addHandler(
            eventType: MapEventType,
            handler: Callbacks.OSMap.Event
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
         * @param map (can be empty) Map that is raising the event
         * @param eventInfo Extra event information (can be the event name, error code messages, etc.)
         * @param args Other arguments that might be needed (can be coords, useful for the click events, for instance)
         */
        // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
        public trigger(
            eventType: MapEventType,
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            map?: OSFramework.OSMap.IMap,
            eventInfo?: string,
            // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
            ...args: any
        ): void {
            // Let's first check if the map has any events associated
            // If the event type is ProviderEvent than we need to get the handlers for the eventInfo -> name of the event
            // If the event type is not ProviderEvent than we need to get the handlers for the eventType (Initialized, OnError, OnEventTriggered)
            const hasEvents =
                eventType === MapEventType.ProviderEvent
                    ? this.handlers.has(eventInfo as MapEventType)
                    : this.handlers.has(eventType);
            if (hasEvents) {
                const handlerEvent = this.handlers.get(eventType);

                switch (eventType) {
                    case MapEventType.Initialized:
                        handlerEvent.trigger(this._map, this._map.widgetId);
                        break;
                    case MapEventType.OnError:
                        handlerEvent.trigger(
                            this._map, // Map Object that was clicked
                            this._map.widgetId, // Id of Map block that was clicked
                            eventInfo // Error Code
                        );
                        break;
                    // The following event is being deprecated. It should get removed soon.
                    case MapEventType.OnEventTriggered:
                        handlerEvent.trigger(
                            this._map, // Map Object that triggered the event
                            this._map.widgetId, // Id of Map block that triggered the event
                            eventInfo // Name of the event that got raised
                        );
                        break;
                    case MapEventType.ProviderEvent:
                        // If the event type is ProviderEvent we need to first check if the event info (name of the event) is a valid one for the provider events
                        if (
                            this._map.validateProviderEvent(eventInfo) === true
                        ) {
                            const handler = this.handlers.get(
                                eventInfo as MapEventType
                            );
                            handler.trigger(
                                this._map, // Map Object that triggered the event
                                this._map.widgetId, // Id of Map block that triggered the event
                                eventInfo, // Name of the event that got raised
                                ...args // Coordinates retrieved from the Map event that got triggered
                            );
                            break;
                        }
                    // If the event is not valid we can fall in the default case of the switch and throw an error
                    // eslint-disable-next-line no-fallthrough
                    default:
                        throw `The event '${eventType}' is not supported in a Map`;
                }
            }
        }
    }
}
