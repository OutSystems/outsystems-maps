// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace OSFramework.Feature {
    export interface IDirections {
        /** Boolean that indicates the enabled state of the Directions feature of the Map */
        isEnabled: boolean;
        /** Remove any Route that has been created (remove directions from the Map)*/
        removeRoute(): OSStructures.ReturnMessage;
        /** Set a new Route based on an start and end location.
         * @param originRoute Defines the start location from which to calculate directions. Works with addresses and coordinates (latitude and longitude).
         * @param destinationRoute Defines the end location to which to calculate directions. Works with addresses and coordinates (latitude and longitude).
         * @param travelMode Specifies what mode of transport to use when calculating directions.
         * @param waypoints Specifies an Array of locations that will alter a route by routing it through the specified locations. Works with addresses and coordinates (latitude and longitude).
         * @param optimizeWaypoints Boolean that indicates if the supplied waypoints should be optimized by rearranging them in a more efficient order.
         * @param avoidTolls Boolean that indicates if the calculated route should avoid tolls (whenever it's possible).
         * @param avoidHighways Boolean that indicates if the calculated route should avoid highways (whenever it's possible).
         * @param avoidFerries Boolean that indicates if the calculated route should avoid ferries (whenever it's possible).
         * @returns Promise containing the ReturnMessage structure {code, message}
         */
        setRoute(
            originRoute: string,
            destinationRoute: string,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            travelMode: any,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            waypoints: any,
            optimizeWaypoints: boolean,
            avoidTolls: boolean,
            avoidHighways: boolean,
            avoidFerries: boolean
        ): Promise<OSStructures.ReturnMessage>;
        /**
         * Set the Directions state on the Map.
         * @param value Boolean that defines the state of the Directions feature.
         */
        setState(value: boolean): void;
    }
}
