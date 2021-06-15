// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace GoogleProvider.Feature {
    export class Directions
        implements
            OSFramework.Feature.IDirections,
            OSFramework.Interface.IBuilder,
            OSFramework.Interface.IDisposable {
        private _directionsRenderer: google.maps.DirectionsRenderer;
        private _directionsService: google.maps.DirectionsService;
        private _isEnabled: boolean;
        private _map: Map.IMapGoogle;

        constructor(map: Map.IMapGoogle) {
            this._map = map;
            this._isEnabled = false;
        }

        /** Makes sure all waypoints from a list of locations (string) gets converted into a list of {location, stopover}. */
        private _waypointsCleanup(
            waypoints: string[]
        ): google.maps.DirectionsWaypoint[] {
            return waypoints.reduce((acc, curr) => {
                acc.push({ location: curr, stopover: true });
                return acc;
            }, []);
        }

        public get isEnabled(): boolean {
            return this._isEnabled;
        }
        public build(): void {
            this._directionsRenderer = new google.maps.DirectionsRenderer();
            this._directionsService = new google.maps.DirectionsService();
            this._directionsRenderer.setMap(this._map.provider);

            this.setState(this._isEnabled);
        }
        public dispose(): void {
            this.setState(false);
            this._directionsService = undefined;
            this._directionsRenderer = undefined;
        }
        public removeRoute(): OSFramework.OSStructures.ReturnMessage {
            this.setState(false);
            if (this._directionsRenderer.getMap() === null) {
                return {
                    code: OSFramework.Enum.ReturnCodes.Success,
                    message: 'Success'
                };
            } else {
                return {
                    code: OSFramework.Enum.ReturnCodes.FailedRemovingDirections,
                    message: `Couldn't remove the Directions from the Map ${this._map.widgetId}`
                };
            }
        }
        public setRoute(
            originRoute: string,
            destinationRoute: string,
            travelMode: google.maps.TravelMode,
            waypoints: string,
            optimizeWaypoints: boolean,
            avoidTolls: boolean,
            avoidHighways: boolean,
            avoidFerries: boolean
        ): Promise<OSFramework.OSStructures.ReturnMessage> {
            const waypts: google.maps.DirectionsWaypoint[] = this._waypointsCleanup(
                JSON.parse(waypoints)
            );
            this.setState(true);
            return (
                this._directionsService
                    .route(
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
                                this._directionsRenderer.setDirections(
                                    response
                                );
                            }
                        }
                    )
                    // If the previous request returns status OK, then we want to return success
                    .then(() => {
                        return {
                            code: OSFramework.Enum.ReturnCodes.Success,
                            message: 'Success'
                        };
                    })
                    // Else, we want to return the reason
                    .catch((reason: string) => {
                        return {
                            code: OSFramework.Enum.ReturnCodes.DirectionsFailed,
                            message:
                                'Directions request failed due to ' + reason
                        };
                    })
            );
        }
        public setState(value: boolean): void {
            this._directionsRenderer.setMap(
                value === true ? this._map.provider : null
            );
            this._isEnabled = value;
        }
    }
}
