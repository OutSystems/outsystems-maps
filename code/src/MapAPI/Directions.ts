// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace MapAPI.Directions {
    /**
     * Function that will retrieve all the legs (steps from one waypoint to the other) from the direction that is rendered on the Map.
     * @param mapId Id of the Map to get the legs from the direction.
     */
    export function GetLegsFromDirection(mapId: string): string {
        const map = MapManager.GetMapById(mapId, true);
        return JSON.stringify(map.features.directions.getLegsFromDirection());
    }

    /**
     * Function that will calculate the total distance of the direction that is rendered on the Map.
     * @param mapId Id of the Map where the total distance of the direction will be calculated.
     */
    export function GetTotalDistanceFromDirection(
        mapId: string
    ): Promise<number> {
        const map = MapManager.GetMapById(mapId, true);
        return map.features.directions.getTotalDistanceFromDirection();
    }

    /**
     * Function that will calculate the total duration of the direction that is rendered on the Map.
     * @param mapId Id of the Map where the total duration of the direction will be calculated.
     */
    export function GetTotalDurationFromDirection(
        mapId: string
    ): Promise<number> {
        const map = MapManager.GetMapById(mapId, true);
        return map.features.directions.getTotalDurationFromDirection();
    }

    /**
     * Function that will load a plugin on the Map. The plugin is a service that provides the routing mechanisms and will later enable the SetDirections and RemoveDirections actions.
     * @param mapId Id of the Map where the Plugin will be loaded
     * @param providerName Name of the service that provides the Directions API
     * @param apiKey APIKey or Token that is provided by the provider and is mandatory to use its Directions API
     * @returns
     */
    export function LoadPlugin(
        mapId: string,
        // The provider will be an entry from LeafletProvider.Constants.Directions.Provider
        providerName: string,
        apiKey: string
    ): string {
        const map = MapManager.GetMapById(mapId, true);
        const pluginResponse = map.features.directions.setPlugin(
            providerName,
            apiKey
        );
        return JSON.stringify(pluginResponse);
    }

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
        let directionOptions =
            new OSFramework.OSStructures.Directions.Options();
        directionOptions = {
            originRoute: origin,
            destinationRoute: destination,
            travelMode,
            waypoints,
            optimizeWaypoints,
            exclude: { avoidTolls, avoidHighways, avoidFerries }
        };
        return map.features.directions
            .setRoute(directionOptions)
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
