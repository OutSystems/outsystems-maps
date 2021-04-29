// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace OSFramework.Event.OSMap {
    /**
     * Class that will be responsible for managing the events of the grid.
     *
     * @export
     * @class GridEventsManager
     * @extends {AbstractEventsManager<MapEventType, OSFramework.Map.IMap>}
     */
    export class MapEventsManager {
        private _map: any; //OSFramework.Map.IMap;

        constructor(map: any /*OSFramework.Grid.IGrid*/) {
            //super();
            this._map = map;
        }
    }
}
