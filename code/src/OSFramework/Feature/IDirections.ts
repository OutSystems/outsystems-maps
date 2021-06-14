// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace OSFramework.Feature {
    export interface IDirections {
        isEnabled: boolean;
        removeRoute(): OSStructures.ReturnMessage;
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
        setState(value: boolean): void;
    }
}
