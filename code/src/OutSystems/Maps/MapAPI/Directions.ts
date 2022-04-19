// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace OutSystems.Maps.MapAPI.Directions {
    /**
     * Function that will retrieve all the legs (steps from one waypoint to the other) from the direction that is rendered on the Map.
     * @param mapId Id of the Map to get the legs from the direction.
     */
    export function GetLegsFromDirection(mapId: string): string {
        const map = OutSystems.Maps.MapAPI.MapManager.GetMapById(mapId, true);
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
     * @param options Defines the stringified options from which to calculate directions. (contains origin, destination, travelMode, waypoints, optimizeWaypoints and avoidance criteria)
     */
    export async function SetDirections(
        mapId: string,
        options: string
    ): Promise<string> {
        const map = MapManager.GetMapById(mapId, true);
        const directionOptions = JSON.parse(options);
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

/// Overrides for the old namespace - calls the new one, lets users know this is no longer in use

// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace MapAPI.Directions {
    export function GetLegsFromDirection(mapId: string): string {
        OSFramework.Helper.LogWarningMessage(
            `${OSFramework.Helper.warningMessage} 'OutSystems.Maps.MapAPI.Directions.GetLegsFromDirection()'`
        );
        return OutSystems.Maps.MapAPI.Directions.GetLegsFromDirection(mapId);
    }

    export function GetTotalDistanceFromDirection(
        mapId: string
    ): Promise<number> {
        OSFramework.Helper.LogWarningMessage(
            `${OSFramework.Helper.warningMessage} 'OutSystems.Maps.MapAPI.Directions.GetTotalDistanceFromDirection()'`
        );
        return OutSystems.Maps.MapAPI.Directions.GetTotalDistanceFromDirection(
            mapId
        );
    }

    export function GetTotalDurationFromDirection(
        mapId: string
    ): Promise<number> {
        OSFramework.Helper.LogWarningMessage(
            `${OSFramework.Helper.warningMessage} 'OutSystems.Maps.MapAPI.Directions.GetTotalDistanceFromDirection()'`
        );
        return OutSystems.Maps.MapAPI.Directions.GetTotalDistanceFromDirection(
            mapId
        );
    }

    export function LoadPlugin(
        mapId: string,
        providerName: string,
        apiKey: string
    ): string {
        OSFramework.Helper.LogWarningMessage(
            `${OSFramework.Helper.warningMessage} 'OutSystems.Maps.MapAPI.Directions.LoadPlugin()'`
        );
        return OutSystems.Maps.MapAPI.Directions.LoadPlugin(
            mapId,
            providerName,
            apiKey
        );
    }

    export function SetDirections(
        mapId: string,
        options: string
    ): Promise<string> {
        OSFramework.Helper.LogWarningMessage(
            `${OSFramework.Helper.warningMessage} 'OutSystems.Maps.MapAPI.Directions.SetDirections()'`
        );
        return OutSystems.Maps.MapAPI.Directions.SetDirections(mapId, options);
    }

    export function RemoveDirections(mapId: string): string {
        OSFramework.Helper.LogWarningMessage(
            `${OSFramework.Helper.warningMessage} 'OutSystems.Maps.MapAPI.Directions.RemoveDirections()'`
        );
        return OutSystems.Maps.MapAPI.Directions.RemoveDirections(mapId);
    }
}
