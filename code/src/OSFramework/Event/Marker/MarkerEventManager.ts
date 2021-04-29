// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace OSFramework.Event.Marker {
    /**
     * Class that will be responsible for managing the events of the grid.
     *
     * @export
     * @class GridEventsManager
     * @extends {AbstractEventsManager<MapEventType, OSFramework.Marker.IMarker>}
     */
    export class MarkerEventsManager {
        private _marker: OSFramework.Marker.IMarker;

        constructor(marker: OSFramework.Marker.IMarker) {
            //super();
            this._marker = marker;
        }
    }
}
