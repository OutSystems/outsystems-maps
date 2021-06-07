// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace MapAPI.Directions {
    /**
     * Function that will create an instance of Map object with the configurations passed
     *
     * @export
     * @param {string} mapId Id of the Map where the change will occur
     * @param {string} configs configurations for the Map in JSON format
     * @returns {*}  {OSMap.IMarker} instance of the Map
     */
    export function SetDirections(
        mapId: string,
        origin: string,
        destination: string,
        travelMode: string,
        waypoints: string[],
        optimizeWaypoints: boolean,
        avoidTolls: boolean,
        avoidHighways: boolean,
        avoidFerries: boolean
    ): boolean {
        const map = MapManager.GetMapById(mapId, true);
        map.features.directions.setRoute(
            origin,
            destination,
            travelMode,
            waypoints,
            optimizeWaypoints,
            avoidTolls,
            avoidHighways,
            avoidFerries
        );
        return true;
    }
}
