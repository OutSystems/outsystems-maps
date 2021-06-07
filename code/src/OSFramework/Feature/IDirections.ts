// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace OSFramework.Feature {
    export interface IDirections {
        isEnabled: boolean;
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
        ): void;
        setState(value: boolean): void;
    }
}
