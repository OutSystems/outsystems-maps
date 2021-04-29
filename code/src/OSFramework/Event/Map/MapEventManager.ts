// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace OSFramework.Event.OSMap {
    /**
     * Class that will be responsible for managing the events of the grid.
     *
     * @export
     * @class GridEventsManager
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
            let event: OSFramework.Event.IEvent<OSFramework.OSMap.IMap>;

            switch (eventType) {
                case MapEventType.Initialized:
                    event = new MapInitializedEvent();
                    break;
                default:
                    throw `The event '${eventType}' is not supported in a grid`;
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
    }
}
