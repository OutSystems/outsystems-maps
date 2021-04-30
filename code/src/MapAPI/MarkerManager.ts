namespace MapAPI.MarkerManager {

    /**
     * Function that creates an instance of Map object with the configurations passed.
     *
     * @export
     * @param {string} mapId Id of the Map where the change will occur.
     * @param {string} configs configurations for the Map in JSON format.
     * @returns {*}  {OSMap.IMap} instance of the Map.
     */
     export function CreateMarker(
        map: OSFramework.OSMap.IMap,
        markerId: string,
        configs: string
    ): OSFramework.Marker.IMarker { 
        if (!map.hasMarker(markerId)) {
            const _marker = GoogleProvider.Marker.MarkerFactory.MakeMarker(map, markerId, JSON.parse(configs));
            return _marker;
        } else {
            throw new Error(
                `There is already a Marker registered on the specified Map under id:${markerId}`
            );
        }
    }
}