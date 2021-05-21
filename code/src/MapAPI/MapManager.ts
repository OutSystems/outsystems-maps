// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace MapAPI.MapManager {
    const maps = new Map<string, OSFramework.OSMap.IMap>(); //map.uniqueId -> Map obj
    let activeMap: OSFramework.OSMap.IMap = undefined;

    /**
     * Function that will change the property value of a given Map.
     *
     * @export
     * @param {string} mapId Id of the Map where the change will occur.
     * @param {string} propertyName name of the property to be changed - some properties of the provider might not work out of be box.
     * @param {*} propertyValue value to which the property should be changed to.
     */
    export function ChangeProperty(
        mapId: string,
        propertyName: string,
        // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
        propertyValue: any
    ): void {
        const map = GetMapById(mapId);

        map.changeProperty(propertyName, propertyValue);
    }

    /**
     * Function that will create an instance of Map object with the configurations passed.
     *
     * @export
     * @param {string} mapId Id of the Map where the change will occur.
     * @param {string} configs configurations for the Map in JSON format.
     * @returns {*}  {OSMap.IMap} instance of the Map.
     */
    export function CreateMap(
        mapId: string,
        mapType: OSFramework.Enum.MapType,
        configs: string
    ): OSFramework.OSMap.IMap {
        const _map = GoogleProvider.Map.MapFactory.MakeMap(
            mapType,
            mapId,
            JSON.parse(configs)
        );

        if (maps.has(mapId)) {
            throw new Error(
                `There is already a Map registered under id:${mapId}`
            );
        }

        maps.set(mapId, _map);
        activeMap = _map;

        Events.CheckPendingEvents(_map);

        return _map;
    }

    /**
     * Function that will get the instance of the current active Map. The active Map, is always the last (existing) Map that was created in the page.
     *
     * @export
     * @returns {*}  {OSMap.IMap} instance of the active Map.
     */
    export function GetActiveMap(): OSFramework.OSMap.IMap {
        return activeMap;
    }

    /**
     * Function that will retrieve all Markers from the Map.
     *
     * @export
     * @param {string} mapId Id of the Map to get the Markers.
     */
    export function GetAllMarkers(
        mapId: string
    ): Array<OSFramework.Marker.IMarker> {
        const map = GetMapById(mapId);

        return map.markers;
    }

    /**
     * Function that will get the instance of a Map, by a given Id.
     *
     * @export
     * @param {string} mapId Id of the Map where the change will occur.
     * @param {boolean} raiseError Will raise errors when there is no object with this uniqueId
     * @returns {*}  {OSMap.IMap} instance of the Map.
     */
    export function GetMapById(
        mapId: string,
        raiseError = true
    ): OSFramework.OSMap.IMap {
        let map: OSFramework.OSMap.IMap;

        //mapId is the UniqueId
        if (maps.has(mapId)) {
            map = maps.get(mapId);
        } else {
            //Search for WidgetId
            for (const p of maps.values()) {
                if (p.equalsToID(mapId)) {
                    map = p;
                    break;
                }
            }
        }

        if (map === undefined && raiseError) {
            throw new Error(`Map id:${mapId} not found`);
        }

        return map;
    }

    /**
     * Function that will get all the maps from the current page
     * @returns Map structure containing all the maps and the corresponding uniqueId
     */
    export function GetMapsFromPage(): Map<string, OSFramework.OSMap.IMap> {
        return maps;
    }

    /**
     * Function that will initialize the provider Map in the page.
     * The current provider Map is GoogleMaps.
     * @export
     * @param {string} mapId Id of the Map that is going to be initialized.
     */
    export function InitializeMap(mapId: string): void {
        const map = GetMapById(mapId);

        map.build();
        Events.CheckPendingEvents(map);
    }

    /**
     * Function that will destroy the Map from the page.
     *
     * @export
     * @param {string} mapId Id of the Map to be destroyed.
     */
    export function RemoveMap(mapId: string): void {
        const map = GetMapById(mapId);

        maps.delete(map.uniqueId);

        //Update activeMap with the most recent one
        if (activeMap.uniqueId === map.uniqueId) {
            activeMap = Array.from(maps.values()).pop();
        }

        map.dispose();
    }

    /**
     * Function that will remove all Markers from a given Map.
     *
     * @export
     * @param {string} mapId Id of the Map to have markers removed.
     */
    export function RemoveMarkers(mapId: string): void {
        const map = GetMapById(mapId);

        map.removeAllMarkers();
    }

    /**
     * Function that will set the height of a given Map.
     *
     * @export
     * @param {string} mapId Id of the Map where the change will occur.
     * @param {string} height new height for the map.
     */
    export function SetHeight(mapId: string, height: string): void {
        const map = GetMapById(mapId);
        let widgetId = map.widgetId;

        //This code below, should be removed... we'd be better of without it.
        //It would imply that the widgetId would be set in a different moment than what is now.
        //*************************************/
        if (widgetId === undefined) {
            widgetId = OSFramework.Helper.GetElementByUniqueId(mapId).closest(
                map.mapTag
            ).id;
        }
        //*************************************/

        const widget = OSFramework.Helper.GetElementByWidgetId(widgetId);

        if (widget) {
            if (height === '') {
                let parentHeight = 0;
                let currParent = widget.parentNode as HTMLElement;
                // asdfads
                do {
                    parentHeight = currParent.offsetHeight;
                    currParent = currParent.parentNode as HTMLElement;
                } while (parentHeight <= 200 && currParent !== document.body);
                height = parentHeight + 'px';
            } else {
                if (isNaN(Number(height)) === false) {
                    height = height + 'px';
                }
            }

            widget.style.setProperty('--map-height', height);
        } else {
            throw new Error(`Map id:${mapId} not found`);
        }
    }
}
