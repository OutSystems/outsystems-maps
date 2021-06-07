// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace GoogleProvider.Feature {
    export class Directions
        implements
            OSFramework.Feature.IDirections,
            OSFramework.Interface.IBuilder,
            OSFramework.Interface.IDisposable {
        private _directionsRenderer: google.maps.DirectionsRenderer;
        private _directionsService: google.maps.DirectionsService;
        private _enabled: boolean;
        private _map: Map.IMapGoogle;

        constructor(map: Map.IMapGoogle) {
            this._map = map;
            this._enabled = false;
        }

        private _waypointsCleanup(
            waypoints: string[]
        ): google.maps.DirectionsWaypoint[] {
            return waypoints.reduce((acc, curr) => {
                acc.push({ location: curr, stopover: true });
                return acc;
            }, []);
        }

        public get isEnabled(): boolean {
            return this._enabled;
        }
        public build(): void {
            this._directionsRenderer = new google.maps.DirectionsRenderer();
            this._directionsService = new google.maps.DirectionsService();
            this._directionsRenderer.setMap(this._map.provider);

            this.setState(this._enabled);
        }
        public dispose(): void {
            this.setState(false);
            this._directionsService = undefined;
            this._directionsRenderer = undefined;
        }
        public setRoute(
            originRoute: string,
            destinationRoute: string,
            travelMode: google.maps.TravelMode,
            waypoints: Array<string> = [],
            optimizeWaypoints: boolean,
            avoidTolls: boolean,
            avoidHighways: boolean,
            avoidFerries: boolean
        ): void {
            const waypts: google.maps.DirectionsWaypoint[] = this._waypointsCleanup(
                waypoints
            );
            this.setState(true);
            this._directionsService.route(
                {
                    origin: {
                        query: originRoute
                    },
                    destination: {
                        query: destinationRoute
                    },
                    waypoints: waypts,
                    optimizeWaypoints,
                    travelMode,
                    avoidTolls,
                    avoidHighways,
                    avoidFerries
                },
                (response, status) => {
                    if (status === 'OK') {
                        this._directionsRenderer.setDirections(response);
                    } else {
                        window.alert(
                            'Directions request failed due to ' + status
                        );
                    }
                }
            );
        }
        public setState(value: boolean): void {
            this._directionsRenderer.setMap(
                value === true ? this._map.provider : null
            );
            this._enabled = value;
        }
    }
}
