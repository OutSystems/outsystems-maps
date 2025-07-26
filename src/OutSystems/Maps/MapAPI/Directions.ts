// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace OutSystems.Maps.MapAPI.Directions {
	/**
	 * Function that will retrieve all the legs (steps from one waypoint to the other) from the direction that is rendered on the Map.
	 * @param mapId Id of the Map to get the legs from the direction.
	 * @returns {string} The legs from the direction.
	 */
	export function GetLegsFromDirection(mapId: string): string {
		const map = OutSystems.Maps.MapAPI.MapManager.GetMapById(mapId);
		const response = map.features.directions.getLegsFromDirection();
		return JSON.stringify(response);
	}

	/**
	 * Function that will calculate the total distance of the direction that is rendered on the Map.
	 * @param mapId Id of the Map where the total distance of the direction will be calculated.
	 * @returns {Promise<number>} The total distance of the direction.
	 */
	export function GetTotalDistanceFromDirection(mapId: string): Promise<number> {
		const map = MapManager.GetMapById(mapId);
		return map.features.directions.getTotalDistanceFromDirection();
	}

	/**
	 * Function that will calculate the total duration of the direction that is rendered on the Map.
	 * @param mapId Id of the Map where the total duration of the direction will be calculated.
	 * @returns {Promise<number>} The total duration of the direction.
	 */
	export function GetTotalDurationFromDirection(mapId: string): Promise<number> {
		const map = MapManager.GetMapById(mapId);
		return map.features.directions.getTotalDurationFromDirection();
	}

	/**
	 * Function that will load a plugin on the Map. The plugin is a service that provides the routing mechanisms and will later enable the SetDirections and RemoveDirections actions.
	 * @param mapId Id of the Map where the Plugin will be loaded
	 * @param providerName Name of the service that provides the Directions API
	 * @param apiKey APIKey or Token that is provided by the provider and is mandatory to use its Directions API
	 * @returns {string} The response from the plugin.
	 */
	export function LoadPlugin(
		mapId: string,
		// The provider will be an entry from Provider.Maps.Leaflet.Constants.Directions.Provider
		providerName: string,
		apiKey: string
	): string {
		const map = MapManager.GetMapById(mapId);
		const pluginResponse = map.features.directions.setPlugin(providerName, apiKey);
		return JSON.stringify(pluginResponse);
	}

	/**
	 * Function that will calculate directions and create the route based on an start and end locations.
	 * @param mapId Id of the Map where the direction will be calculated.
	 * @param options Defines the stringified options from which to calculate directions. (contains origin, destination, travelMode, waypoints, optimizeWaypoints and avoidance criteria)
	 * @returns {Promise<string>} The response from the directions.
	 */
	export async function SetDirections(mapId: string, options: string): Promise<string> {
		const map = MapManager.GetMapById(mapId);
		const directionOptions = JSON.parse(options);
		return map.features.directions
			.setRoute(directionOptions)
			.then((result) => {
				return JSON.stringify(result);
			})
			.catch((error) => {
				return JSON.stringify(error);
			});
	}

	/**
	 * Function that will remove the directions created on a Map.
	 * @param mapId Id of the Map to add a direction
	 * @returns {string} The response from the directions.
	 */
	export function RemoveDirections(mapId: string): string {
		const map = MapManager.GetMapById(mapId);
		const response = map.features.directions.removeRoute();
		return JSON.stringify(response);
	}
}
