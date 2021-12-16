// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace LeafletProvider.Feature {
    enum ResolveType {
        SetRoute,
        GetDuration,
        GetDistance
    }

    export class Directions
        implements
            OSFramework.Feature.IDirections,
            OSFramework.Interface.IBuilder,
            OSFramework.Interface.IDisposable
    {
        // Will host the method: this._routesFoundHandler.bind(this,resolve,ResolveType.GetDistance)
        private _bindDistance: OSFramework.Callbacks.Generic;
        // Will host the method: this._routesFoundHandler.bind(this,resolve,ResolveType.GetDuration)
        private _bindDuration: OSFramework.Callbacks.Generic;
        // Will host the method: this._routesFoundHandler.bind(this,undefined,ResolveType.SetRoute)
        private _bindSetRoute: OSFramework.Callbacks.Generic;

        private _currentDistance: number;
        private _currentDuration: number;

        /** IconOptions for the Icon that is going to be created per each Waypoint of the route */
        private _defaultIcon: L.DivIconOptions;
        /** TooltipOptions for the Text that will appear over the Waypoint Icon*/
        private _defaultTooltip: L.TooltipOptions;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        private _directionsRenderer: any;

        private _isEnabled: boolean;
        private _map: OSMap.IMapLeaflet;
        private _providerName: string;

        constructor(map: OSMap.IMapLeaflet) {
            this._map = map;
            this._isEnabled = false;
            //Let's make sure to reset the currentDistance and currentDuration with the values NaN.
            //By making this, we ensure any time the GetDistance and GetDuration methods get invoked, they will make a new request.
            this._currentDistance = NaN;
            this._currentDuration = NaN;

            this._bindSetRoute = this._routesFoundHandler.bind(
                this,
                undefined, // undefined resolve
                ResolveType.SetRoute // SetRoute resolveType
            );
            // Let's not set the following variables until they are really needed (by invoking GetDistance/GetDuration)
            this._bindDistance = undefined;
            this._bindDuration = undefined;

            this._defaultIcon = {
                iconSize: [24, 40],
                className: 'marker-leaflet-icon-wp',
                iconAnchor: [12, 40]
            };
            this._defaultTooltip = {
                permanent: true,
                direction: 'top',
                className: 'marker-leaflet-transparent-tooltip-wp'
            };
        }

        public get isEnabled(): boolean {
            return this._isEnabled;
        }

        /** We need to convert the number of the waypoint into a char. Ideally 1=A, 26=Z (...) 27=AA, AZ, BA, BZ, (...), ZZ */
        private _buildCharFromNumber(n: number): string {
            let char = '';
            if (n >= 0 && n < 26) {
                char = String.fromCharCode(65 + n);
            } else if (n < 702) {
                char =
                    String.fromCharCode(65 + (n - 26) / 26) +
                    String.fromCharCode(65 + ((n - 26) % 26));
            }
            return char;
        }

        /**
         * Will build the directionsRenderer object (provider) based on the ApiKey and the specified Provider.
         * This method is used by the LoadPlugin API.
         */
        private _buildDirectionsRenderer(
            provider: Constants.Directions.Provider,
            apiKey: string
        ): void {
            this._directionsRenderer = new L.Routing.Control({
                router: new L.Routing[provider](apiKey, {}),
                // Make sure to fit (auto zoom and center) any new routes that get created
                fitSelectedRoutes: true,
                // Start without waypoints as this method is invoked by the loadPlugin and not by the setDirections
                plan: L.Routing.plan([], {
                    createMarker: function (i, wp) {
                        // Will create a marker on the Leaflet side to replace the default icon
                        return L.marker(wp.latLng, {
                            icon: new L.DivIcon(this._defaultIcon)
                        }).bindTooltip(
                            // Make sure to bind a letter (A-ZZ) to the tooltip (text over the icon)
                            `${this._buildCharFromNumber(i)}`,
                            this._defaultTooltip
                        );
                    }.bind(this),
                    routeWhileDragging: false,
                    draggableWaypoints: false,
                    // Remove the default overlay that contains the directions (created by the leaflet-routing-machine plugin)
                    createGeocoderElement: undefined
                })
            });
        }

        /** Checks if the DirectionsRenderer object has been created or not */
        private _hasDirectionsRenderer(): boolean {
            return this._directionsRenderer !== undefined;
        }

        /** Handler for the routesfound event from Leaflet-Routing-Machine
         * Can be used by the GetDistance or GetDuration methods and therefore will have specific attributes binded
         * @param resolve Will be the resolve method from the Promise
         * @param isDistance In case of a GetDistance this Boolean should be True. Otherwise, it should be False.
         * @param e Event that got triggered (L.Routing.RoutingResultEvent) and respective structure
         */
        private _routesFoundHandler(
            resolve?: OSFramework.Callbacks.Generic,
            resolveType?: ResolveType,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            e?: any
        ) {
            // This method was invoked by the setRoute and because there might exist concurrency between the setRoute and the getDistance or getDirections methods
            // when they are invoked one after the other (inside an action flow [OS] for instance), we need to ensure the listeners get removed after the "routesfound" event is triggered
            this._currentDistance = e.routes[0].summary.totalDistance;
            this._currentDuration = e.routes[0].summary.totalTime;
            // If the resolve exists, means that this handler was invoked by the methods getDistance or getDuration as it has been passed via "bind"
            // Otherwise, it means that the handler was invoked by the method setRoute on the creation of the route
            if (resolve !== undefined) {
                if (resolveType === ResolveType.GetDistance) {
                    // Make sure to resolve with the callback "resolve" and passing the currentDistance as an argument
                    resolve(this._currentDistance);
                    // invoked by the getDistance method -> as soon as the routesFoundHandler gets executed and after getting the currentDistance and currentDuration we can remove the listener for the getDistance.
                    this._directionsRenderer.off(
                        'routesfound',
                        this._bindDistance
                    );
                } else if (resolveType === ResolveType.GetDuration) {
                    // Make sure to resolve with the callback "resolve" and passing the currentDuration as an argument
                    resolve(this._currentDuration);
                    // invoked by the getDuration method -> as soon as the routesFoundHandler gets executed and after getting the currentDistance and currentDuration we can remove the listener for the getDuration.
                    this._directionsRenderer.off(
                        'routesfound',
                        this._bindDuration
                    );
                }
            } else {
                if (resolveType === ResolveType.SetRoute) {
                    // invoked by the setRoute method -> as soon as the routesFoundHandler gets executed and after getting the currentDistance and currentDuration we can remove the listener for the setRoute.
                    this._directionsRenderer.off(
                        'routesfound',
                        this._bindSetRoute
                    );
                }
            }
        }

        /**
         * Sets the avoidance criteria (avoidTolls, avoidHighways, avoidFerries) on the directionsRenderer routing service
         */
        private _setExcludes(
            dirExclude: OSFramework.OSStructures.Directions.ExcludeCriteria
        ): boolean {
            // If the Map has no directionsRenderer, return false.
            if (!this._hasDirectionsRenderer()) return false;

            const exclude = [];
            dirExclude.avoidTolls && exclude.push('toll');
            dirExclude.avoidHighways && exclude.push('motorway');
            dirExclude.avoidFerries && exclude.push('ferry');

            // Set the exclude option
            this._directionsRenderer.getRouter().options.exclude = exclude;
            return true;
        }

        /**
         * Sets the travelMode on the directionsRenderer routing service
         */
        private _setTravelMode(travelMode: string): boolean {
            // If the Map has no directionsRenderer, return false.
            // If the provider of the routing service doesn't have the chosen travelMode option, return false
            if (
                !this._hasDirectionsRenderer() ||
                Constants.Directions[this._providerName]?.TravelModes[
                    travelMode
                ] === undefined
            ) {
                return false;
            }

            // Set the directions profile (travelMode)
            this._directionsRenderer.getRouter().options.profile =
                Constants.Directions[this._providerName].TravelModes[
                    travelMode
                ];
            return true;
        }

        /**
         * Validate coordinates from an array of waypoints.
         * If all the coordinates are valid, then return a Promise of the resolved Array of waypoints in correct format.
         * Otherwise, return a Promise of an error with the FailedSetDirections errorCode.
         */
        private _validateCoordinates(
            waypoints: Array<string>
        ): Promise<Array<OSFramework.OSStructures.OSMap.Coordinates>> {
            const wayptsFinal = [];
            return new Promise((resolve, reject) => {
                waypoints.forEach((wpt) =>
                    Helper.Conversions.ValidateCoordinates(wpt)
                        .then((response) => {
                            wayptsFinal.push(
                                new L.LatLng(response.lat, response.lng)
                            );
                            if (waypoints.length === wayptsFinal.length) {
                                resolve(wayptsFinal);
                            }
                        })
                        .catch(() => {
                            reject({
                                code: OSFramework.Enum.ErrorCodes
                                    .LIB_FailedSetDirections,
                                message: `One or more set of coordinates is not valid`
                            });
                        })
                );
            });
        }

        public build(): void {
            this.setState(this._isEnabled);
        }

        public dispose(): void {
            this.setState(false);
            this._directionsRenderer = undefined;
        }

        /** This method is not implemented for the LeafletProvider Directions API */
        public getLegsFromDirection(): Array<OSFramework.OSStructures.Directions.DirectionLegs> {
            throw new Error('Method not implemented.');
        }

        public getTotalDistanceFromDirection(): Promise<number> {
            // Validate if the directionsRenderer exists
            if (!this._hasDirectionsRenderer()) {
                OSFramework.Helper.ThrowError(
                    this._map,
                    OSFramework.Enum.ErrorCodes.API_FailedNoPluginDirections
                );
                return new Promise((resolve) => resolve(0));
            }
            return new Promise((resolve) => {
                // If there currentDistance is not NaN, this means it already has a value and the directions didn't change,
                // so we can resolve the Promise with the same distance we had before
                if (isNaN(this._currentDistance)) {
                    this._bindDistance = this._routesFoundHandler.bind(
                        this,
                        resolve,
                        ResolveType.GetDistance
                    );
                    this._directionsRenderer.on(
                        'routesfound',
                        this._bindDistance
                    );
                } else {
                    resolve(this._currentDistance);
                }
            });
        }

        public getTotalDurationFromDirection(): Promise<number> {
            // Validate if the directionsRenderer exists
            if (!this._hasDirectionsRenderer()) {
                OSFramework.Helper.ThrowError(
                    this._map,
                    OSFramework.Enum.ErrorCodes.API_FailedNoPluginDirections
                );
                return new Promise((resolve) => resolve(0));
            }
            return new Promise((resolve) => {
                // If there currentDuration is not NaN, this means it already has a value and the directions didn't change,
                // so we can resolve the Promise with the same duration we had before
                if (isNaN(this._currentDuration)) {
                    this._bindDuration = this._routesFoundHandler.bind(
                        this,
                        resolve,
                        ResolveType.GetDuration
                    );
                    this._directionsRenderer.on(
                        'routesfound',
                        this._bindDuration
                    );
                } else {
                    resolve(this._currentDuration);
                }
            });
        }

        public removeRoute(): OSFramework.OSStructures.ReturnMessage {
            this.setState(false);
            const returnigMessage =
                new OSFramework.OSStructures.ReturnMessage();
            if (!this._hasDirectionsRenderer()) {
                returnigMessage.isSuccess = true;
            } else {
                returnigMessage.code =
                    OSFramework.Enum.ErrorCodes.API_FailedRemoveDirections;
            }
            return returnigMessage;
        }

        public setPlugin(
            provider: Constants.Directions.Provider | string,
            apiKey: string
        ): OSFramework.OSStructures.ReturnMessage {
            if (this._directionsRenderer !== undefined) {
                this.removeRoute();
            }
            this._buildDirectionsRenderer(
                Constants.Directions.Provider[provider] || provider,
                apiKey
            );
            this.setState(true);
            this._providerName = provider;
            const returnigMessage =
                new OSFramework.OSStructures.ReturnMessage();
            if (this._hasDirectionsRenderer()) {
                returnigMessage.isSuccess = true;
            } else {
                returnigMessage.code =
                    OSFramework.Enum.ErrorCodes.API_FailedLoadingPlugin;
            }
            return returnigMessage;
        }

        public setRoute(
            directionOptions: OSFramework.OSStructures.Directions.Options
        ): Promise<OSFramework.OSStructures.ReturnMessage> {
            let returningMessage = new OSFramework.OSStructures.ReturnMessage();
            //Let's make sure to reset the currentDistance and currentDuration with the values NaN.
            //By making this, we ensure any time the GetDistance and GetDuration methods get invoked, they will make a new request.
            this._currentDistance = NaN;
            this._currentDuration = NaN;

            // Validate if the directionsRenderer exists
            if (!this._hasDirectionsRenderer()) {
                returningMessage.code =
                    OSFramework.Enum.ErrorCodes.API_FailedNoPluginDirections;
                return new Promise((resolve) => resolve(returningMessage));
            }

            // Make sure to return an error code if the travel mode is not valid
            if (this._setTravelMode(directionOptions.travelMode) === false) {
                returningMessage.code =
                    OSFramework.Enum.ErrorCodes.CFG_InvalidTravelMode;
                return new Promise((resolve) => resolve(returningMessage));
            }

            // Set the exclude object (Avoidance criteria)
            this._setExcludes(directionOptions.exclude);

            this._directionsRenderer.on('routesfound', this._bindSetRoute);

            // Call the Plugin route mechanism to render the directions on the Map.
            this._directionsRenderer.route({});
            this.setState(true);

            // Remove the container that is generated by leaflet-routing-machine dependency
            // This container would overlap with the Map
            this._directionsRenderer.getContainer().remove();

            // Make sure the origin and the destination are both inside the waypoints array
            const waypts = [
                directionOptions.originRoute,
                ...JSON.parse(directionOptions.waypoints),
                directionOptions.destinationRoute
            ];

            // Validate coordinate from the waypoints array
            // If all the coordinates are valid, then setWaypoints on the directionsRenderer
            return this._validateCoordinates(waypts)
                .then((response) => {
                    this._directionsRenderer.setWaypoints(response);

                    returningMessage.isSuccess = true;
                    return returningMessage;
                })
                .catch((error) => {
                    returningMessage = {
                        code: error.code,
                        message: error.message
                    };
                    return returningMessage;
                });
        }

        public setState(value: boolean): void {
            if (value === true) {
                this._directionsRenderer &&
                    this._directionsRenderer.addTo(this._map.provider);
            } else {
                this._directionsRenderer &&
                    this._map.provider.removeControl(this._directionsRenderer);
            }
            this._isEnabled = value;
        }
    }
}
