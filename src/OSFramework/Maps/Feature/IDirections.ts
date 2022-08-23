// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace OSFramework.Maps.Feature {
    export interface IDirections {
        /** Boolean that indicates the enabled state of the Directions feature of the Map */
        isEnabled: boolean;
        /** Get All Legs from Direction (when direction contains waypoints, each leg is one step from a point to the next)*/
        getLegsFromDirection(): Array<OSStructures.Directions.DirectionLegs>;
        /** Get Total Distance from Direction (sum in meters of all the distances from all legs).
         */
        getTotalDistanceFromDirection(): Promise<number>;
        /** Get Total Duration from Direction (sum in seconds of all the durations from all legs)
         */
        getTotalDurationFromDirection(): Promise<number>;
        /** Remove any Route that has been created (remove directions from the Map)*/
        removeRoute(): OSStructures.ReturnMessage;
        /**
         * Sets and loads a plugin on the Leaflet Map. The plugin is a service that provides the routing mechanisms and will later enable the SetDirections and RemoveDirections actions.
         * @param providerName Name of the service that provides the Directions API
         * @param apiKey APIKey or Token that is provided by the provider and is mandatory to use its Directions API
         */
        setPlugin(
            providerName: string,
            apiKey: string
        ): OSStructures.ReturnMessage;
        /** Set a new Route based on an start and end location.
         * @param originRoute Defines the start location from which to calculate directions. Works with addresses and coordinates (latitude and longitude).
         * @param destinationRoute Defines the end location to which to calculate directions. Works with addresses and coordinates (latitude and longitude).
         * @param travelMode Specifies what mode of transport to use when calculating directions.
         * @param waypoints Specifies a stringified array of locations that will alter a route by routing it through the specified locations. Works with addresses and coordinates (latitude and longitude).
         * @param optimizeWaypoints Boolean that indicates if the supplied waypoints should be optimized by rearranging them in a more efficient order.
         * @param avoidTolls Boolean that indicates if the calculated route should avoid tolls (whenever it's possible).
         * @param avoidHighways Boolean that indicates if the calculated route should avoid highways (whenever it's possible).
         * @param avoidFerries Boolean that indicates if the calculated route should avoid ferries (whenever it's possible).
         * @returns Promise containing the ReturnMessage structure {code, message}
         */
        setRoute(
            directionOptions: OSFramework.Maps.OSStructures.Directions.Options
        ): Promise<OSStructures.ReturnMessage>;
        /**
         * Set the Directions state on the Map.
         * @param value Boolean that defines the state of the Directions feature.
         */
        setState(value: boolean): void;
    }
}
