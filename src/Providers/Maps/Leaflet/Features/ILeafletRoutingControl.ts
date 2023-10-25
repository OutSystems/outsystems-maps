// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace Provider.Maps.Leaflet.Feature {
    export interface ILeafletRoutingControl {
        addTo(map: L.Map): void;
        getContainer?(): HTMLElement;
        getPlan(): unknown;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        getRouter(): any;
        getWaypoints(): unknown[];
        off?(type: string, fn: (event: unknown) => void);
        on(
            type: string,
            fn: (event: unknown) => void,
            context?: unknown
        ): unknown;
        route(param: unknown): void;
        setWaypoints(waypoints: unknown[]): unknown;
        spliceWaypoints(
            index: number,
            waypointsToRemove: number,
            ...wayPoints: unknown[]
        ): unknown[];
    }
}
