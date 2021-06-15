// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace MapAPI.Directions {
    /**
     * Function that will calculate directions and create the route based on an start and end locations.
     * @param mapId Id of the Map where the direction will be calculated.
     * @param origin Defines the start location from which to calculate directions. Works with addresses and coordinates (latitude and longitude).
     * @param destination Defines the end location to which to calculate directions. Works with addresses and coordinates (latitude and longitude).
     * @param travelMode Specifies what mode of transport to use when calculating directions.
     * @param waypoints Specifies an Array of locations that will alter a route by routing it through the specified locations. Works with addresses and coordinates (latitude and longitude).
     * @param optimizeWaypoints Boolean that indicates if the supplied waypoints should be optimized by rearranging them in a more efficient order.
     * @param avoidTolls Boolean that indicates if the calculated route should avoid tolls (whenever it's possible).
     * @param avoidHighways Boolean that indicates if the calculated route should avoid highways (whenever it's possible).
     * @param avoidFerries Boolean that indicates if the calculated route should avoid ferries (whenever it's possible).
     */
    export async function SetDirections(
        mapId: string,
        origin: string,
        destination: string,
        travelMode: string,
        waypoints: string,
        optimizeWaypoints: boolean,
        avoidTolls: boolean,
        avoidHighways: boolean,
        avoidFerries: boolean
    ): Promise<string> {
        const map = MapManager.GetMapById(mapId, true);
        return map.features.directions
            .setRoute(
                origin,
                destination,
                travelMode,
                waypoints,
                optimizeWaypoints,
                avoidTolls,
                avoidHighways,
                avoidFerries
            )
            .then((response) => JSON.stringify(response));
    }

    /**
     * Function that will remove the directions created on a Map.
     * @param mapId Id of the Map to add a direction
     */
    export function RemoveDirections(mapId: string): string {
        const map = MapManager.GetMapById(mapId, true);
        return JSON.stringify(map.features.directions.removeRoute());
    }
}
