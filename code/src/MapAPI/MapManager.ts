namespace MapAPI.MapManager {
    const maps = new Map<string, OSFramework.OSMap.IMap>(); //grid.uniqueId -> Grid obj
    let activeMap: OSFramework.OSMap.IMap = undefined;

    /**
     * Function that creates an instance of Map object with the configurations passed.
     *
     * @export
     * @param {string} mapId Id of the Map where the change will occur.
     * @param {string} configs configurations for the Map in JSON format.
     * @returns {*}  {OSMap.IMap} instance of the Map.
     */
     export function CreateMap(
        mapId: string,
        configs: string
    ): OSFramework.OSMap.IMap {
        const _map = GoogleProvider.Map.MapFactory.MakeMap(OSFramework.Enum.MapType.GoogleMaps, mapId, JSON.parse(configs));

        if (maps.has(mapId)) {
            throw new Error(
                `There is already a Map registered under id:${mapId}`
            );
        }

        maps.set(mapId, _map);
        activeMap = _map;

        Events.CheckPendingEvents(mapId);

        return _map;
    }

    /**
     * Function that initializes the provider Map in the page.
     * The current provider Map is GoogleMaps.
     * @export
     * @param {string} mapId Id of the Grid that is going to be initialized.
     */
    export function InitializeMap(mapId: string): void {
        const map = GetMapById(mapId);

        map.build();
    }

    /**
     * Function that gets the instance of a Map, by a given Id.
     *
     * @export
     * @param {string} mapId Id of the Map where the change will occur.
     * @param {boolean} raiseError Will raise errors when there is no object with this uniqueId
     * @returns {*}  {OSMap.IMap} instance of the grid.
     */
     export function GetMapById(
        mapId: string,
        raiseError: boolean = true
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
     * Function that gets the instance of the current active Map. The active Map, is always the last (existing) Map that was created in the page.
     *
     * @export
     * @returns {*}  {OSMap.IMap} instance of the active Map.
     */
    export function GetActiveMap(): OSFramework.OSMap.IMap {
        return activeMap;
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
     * Function that will change the property of a given Map.
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
     * Function that will destroy the Map from the page.
     *
     * @export
     * @param {string} mapId Id of the Map to be destroyed.
     */
    export function RemoveAllMarkers(mapId: string): void {
        const map = GetMapById(mapId);

        map.removeAllMarkers();
    }

}