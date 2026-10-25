// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace Provider.Maps.Leaflet.Feature {
	const enum ResolveType {
		SetRoute,
		GetDuration,
		GetDistance,
	}

	export class Directions
		implements
			OSFramework.Maps.Feature.IDirections,
			OSFramework.Maps.Interface.IBuilder,
			OSFramework.Maps.Interface.IDisposable
	{
		// Will host the method: this._routeOutcomeHandler.bind(this,undefined,ResolveType.SetRoute)
		private _bindSetRoute: OSFramework.Maps.Callbacks.Generic;

		private _currentDistance: number;
		private _currentDuration: number;

		/** IconOptions for the Icon that is going to be created per each Waypoint of the route */
		private _defaultIcon: L.DivIconOptions;
		/** TooltipOptions for the Text that will appear over the Waypoint Icon*/
		private _defaultTooltip: L.TooltipOptions;

		private _directionsRenderer: ILeafletRoutingControl;

		private _isEnabled: boolean;
		private _map: OSMap.IMapLeaflet;
		// Listeners of the GetDistance/GetDuration calls that are waiting for the current route request to finish
		private _pendingTotalListeners: OSFramework.Maps.Callbacks.Generic[];
		private _providerName: string;

		constructor(map: OSMap.IMapLeaflet) {
			this._map = map;
			this._isEnabled = false;
			//Let's make sure to reset the currentDistance and currentDuration with the values NaN.
			//By making this, we ensure any time the GetDistance and GetDuration methods get invoked, they will make a new request.
			this._currentDistance = NaN;
			this._currentDuration = NaN;

			this._bindSetRoute = this._routeOutcomeHandler.bind(
				this,
				undefined, // undefined resolve
				ResolveType.SetRoute // SetRoute resolveType
			);
			this._pendingTotalListeners = [];

			this._defaultIcon = {
				iconSize: [24, 40],
				className: 'marker-leaflet-icon-wp',
				iconAnchor: [12, 40],
			};
			this._defaultTooltip = {
				permanent: true,
				direction: 'top',
				className: 'marker-leaflet-transparent-tooltip-wp',
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
				char = String.fromCharCode(65 + (n - 26) / 26) + String.fromCharCode(65 + ((n - 26) % 26));
			}
			return char;
		}

		/**
		 * Will build the directionsRenderer object (provider) based on the ApiKey and the specified Provider.
		 * This method is used by the LoadPlugin API.
		 */
		private _buildDirectionsRenderer(provider: Constants.Directions.Provider, apiKey: string): void {
			this._directionsRenderer = new L.Routing.Control({
				router: new L.Routing[provider](apiKey, {}),
				// Make sure to fit (auto zoom and center) any new routes that get created
				fitSelectedRoutes: true,
				// Start without waypoints as this method is invoked by the loadPlugin and not by the setDirections
				plan: L.Routing.plan([], {
					createMarker: function (i, wp) {
						// Will create a marker on the Leaflet side to replace the default icon
						return L.marker(wp.latLng, {
							icon: new L.DivIcon(this._defaultIcon),
						}).bindTooltip(
							// Make sure to bind a letter (A-ZZ) to the tooltip (text over the icon)
							`${this._buildCharFromNumber(i)}`,
							this._defaultTooltip
						);
					}.bind(this),
					routeWhileDragging: false,
					draggableWaypoints: false,
					// Remove the default overlay that contains the directions (created by the leaflet-routing-machine plugin)
					createGeocoderElement: undefined,
				}),
			});

			// Make sure to raise the Map OnError event when the routing service fails (eg: network error, no route found).
			// It is raised once per failed route: the GetDistance/GetDuration methods then return 0 without raising it again.
			this._directionsRenderer.on(Constants.Directions.Events.routingerror, (e: IRoutingErrorEvent) =>
				OSFramework.Maps.Helper.ThrowError(
					this._map,
					OSFramework.Maps.Enum.ErrorCodes.LIB_FailedSetDirections,
					e.error?.message ?? e.error?.status?.toString()
				)
			);
		}

		/** Checks if the DirectionsRenderer object has been created or not */
		private _hasDirectionsRenderer(): boolean {
			return this._directionsRenderer !== undefined;
		}

		/** Stops listening to the end of a route request (see _onRouteOutcome) */
		private _offRouteOutcome(listener: OSFramework.Maps.Callbacks.Generic): void {
			this._directionsRenderer.off(Constants.Directions.Events.routesfound, listener);
			this._directionsRenderer.off(Constants.Directions.Events.routingerror, listener);
		}

		/** Listens to the end of a route request, either successful (routesfound event) or not (routingerror event) */
		private _onRouteOutcome(listener: OSFramework.Maps.Callbacks.Generic): void {
			this._directionsRenderer.on(Constants.Directions.Events.routesfound, listener);
			this._directionsRenderer.on(Constants.Directions.Events.routingerror, listener);
		}

		/** Handler for the end of a route request from Leaflet-Routing-Machine (routesfound and routingerror events)
		 * Can be used by the GetDistance or GetDuration methods and therefore will have specific attributes binded
		 * @param resolve Will be the resolve method from the Promise
		 * @param resolveType Method that is waiting for the route (SetRoute, GetDistance or GetDuration)
		 * @param e Event that got triggered and respective structure.
		 * It is undefined when a GetDistance/GetDuration call gets settled without a route result (see _settlePendingTotals).
		 * @param listener Listener registered by the GetDistance/GetDuration method, that needs to be removed
		 */
		private _routeOutcomeHandler(
			resolve?: OSFramework.Maps.Callbacks.Generic,
			resolveType?: ResolveType,
			e?: IRoutingResultEvent | IRoutingErrorEvent,
			listener?: OSFramework.Maps.Callbacks.Generic
		) {
			let bind: OSFramework.Maps.Callbacks.Generic;
			// This method was invoked by the setRoute and because there might exist concurrency between the setRoute and the getDistance or getDirections methods
			// when they are invoked one after the other (inside an action flow [OS] for instance), we need to ensure the listeners get removed after the "routesfound" or "routingerror" event is triggered
			if (e !== undefined) {
				// A routingerror event has no routes, in that case the distance and duration will be 0
				const routes = (e as IRoutingResultEvent).routes;
				this._currentDistance = routes ? routes[0].summary.totalDistance : 0;
				this._currentDuration = routes ? routes[0].summary.totalTime : 0;
			}
			// If the resolve exists, means that this handler was invoked by the methods getDistance or getDuration
			// Otherwise, it means that the handler was invoked by the method setRoute on the creation of the route
			if (resolve !== undefined) {
				if (resolveType === ResolveType.GetDistance) {
					// Make sure to resolve with the callback "resolve" and passing the currentDistance as an argument
					resolve(this._currentDistance);
				} else if (resolveType === ResolveType.GetDuration) {
					// Make sure to resolve with the callback "resolve" and passing the currentDuration as an argument
					resolve(this._currentDuration);
				}
				// Several GetDistance/GetDuration calls might be waiting for the same route, so remove the listener that got invoked
				bind = listener;
				this._pendingTotalListeners = this._pendingTotalListeners.filter((pending) => pending !== listener);
			} else {
				if (resolveType === ResolveType.SetRoute) {
					// invoked by the setRoute method -> as soon as the routeOutcomeHandler gets executed and after getting the currentDistance and currentDuration we can later remove the listener for the setRoute.
					bind = this._bindSetRoute;
				}
			}
			// remove the routesfound and routingerror event handlers, depending on the method (setRoute, getDistance, getDuration), will be have different bind value
			this._offRouteOutcome(bind);
		}

		/**
		 * Sets the avoidance criteria (avoidTolls, avoidHighways, avoidFerries) on the directionsRenderer routing service
		 */
		private _setExcludes(dirExclude: OSFramework.Maps.OSStructures.Directions.ExcludeCriteria): boolean {
			// If the Map has no directionsRenderer, return false.
			if (this._hasDirectionsRenderer() === false) return false;

			const exclude: string[] = [];
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
				this._hasDirectionsRenderer() === false ||
				Constants.Directions[this._providerName]?.TravelModes[travelMode] === undefined
			) {
				return false;
			}

			// Set the directions profile (travelMode)
			this._directionsRenderer.getRouter().options.profile =
				Constants.Directions[this._providerName].TravelModes[travelMode];
			return true;
		}

		/**
		 * Resolves the GetDistance/GetDuration calls that are waiting for a route request that will no longer finish (eg: it got cancelled).
		 * If the route totals are still unknown they become 0, as there is no route.
		 */
		private _settlePendingTotals(): void {
			if (Number.isNaN(this._currentDistance)) this._currentDistance = 0;
			if (Number.isNaN(this._currentDuration)) this._currentDuration = 0;
			// Copy the array, as each listener removes itself from it
			[...this._pendingTotalListeners].forEach((listener) => listener(undefined));
		}

		/**
		 * Validate coordinates from an array of waypoints.
		 * If all the coordinates are valid, then return a Promise of the resolved Array of waypoints in correct format.
		 * Otherwise, return a Promise of an error with the FailedSetDirections errorCode.
		 */
		private _validateCoordinates(
			waypoints: Array<string>
		): Promise<Array<OSFramework.Maps.OSStructures.OSMap.Coordinates>> {
			const wayptsFinal = [];
			return new Promise((resolve, reject) => {
				waypoints.forEach((wpt) =>
					Helper.Conversions.ValidateCoordinates(wpt)
						.then((response) => {
							wayptsFinal.push(new L.LatLng(response.lat as number, response.lng as number));
							if (waypoints.length === wayptsFinal.length) {
								resolve(wayptsFinal);
							}
						})
						.catch(() => {
							reject({
								code: OSFramework.Maps.Enum.ErrorCodes.LIB_FailedSetDirections,
								message: `One or more set of coordinates is not valid`,
							});
						})
				);
			});
		}

		/**
		 * Makes a GetDistance/GetDuration call wait for the route request that is in progress.
		 * @param resolve Will be the resolve method from the Promise
		 * @param resolveType Method that is waiting for the route (GetDistance or GetDuration)
		 */
		private _waitForRouteTotal(resolve: OSFramework.Maps.Callbacks.Generic, resolveType: ResolveType): void {
			const listener = (e) => this._routeOutcomeHandler(resolve, resolveType, e, listener);
			this._pendingTotalListeners.push(listener);
			this._onRouteOutcome(listener);
		}

		public build(): void {
			this.setState(this._isEnabled);
		}

		public dispose(): void {
			this.setState(false);
			this._directionsRenderer = undefined;
		}

		/** This method is not implemented for the LeafletProvider Directions API */
		public getLegsFromDirection(): Array<OSFramework.Maps.OSStructures.Directions.DirectionLegs> {
			throw new Error('Method not implemented.');
		}

		public getTotalDistanceFromDirection(): Promise<number> {
			// Validate if the directionsRenderer exists
			if (this._hasDirectionsRenderer() === false) {
				OSFramework.Maps.Helper.ThrowError(
					this._map,
					OSFramework.Maps.Enum.ErrorCodes.API_FailedNoPluginDirections
				);
				return new Promise((resolve) => resolve(0));
			}
			return new Promise((resolve) => {
				// If there currentDistance is not NaN, this means it already has a value and the directions didn't change,
				// so we can resolve the Promise with the same distance we had before
				if (isNaN(this._currentDistance)) {
					this._waitForRouteTotal(resolve, ResolveType.GetDistance);
				} else {
					resolve(this._currentDistance);
				}
			});
		}

		public getTotalDurationFromDirection(): Promise<number> {
			// Validate if the directionsRenderer exists
			if (this._hasDirectionsRenderer() === false) {
				OSFramework.Maps.Helper.ThrowError(
					this._map,
					OSFramework.Maps.Enum.ErrorCodes.API_FailedNoPluginDirections
				);
				return new Promise((resolve) => resolve(0));
			}
			return new Promise((resolve) => {
				// If there currentDuration is not NaN, this means it already has a value and the directions didn't change,
				// so we can resolve the Promise with the same duration we had before
				if (isNaN(this._currentDuration)) {
					this._waitForRouteTotal(resolve, ResolveType.GetDuration);
				} else {
					resolve(this._currentDuration);
				}
			});
		}

		public removeRoute(): OSFramework.Maps.OSStructures.ReturnMessage {
			this.setState(false);
			const returningMessage = new OSFramework.Maps.OSStructures.ReturnMessage();
			if (this._hasDirectionsRenderer() === false) {
				returningMessage.isSuccess = true;
			} else {
				returningMessage.code = OSFramework.Maps.Enum.ErrorCodes.API_FailedRemoveDirections;
			}
			return returningMessage;
		}

		public setPlugin(
			provider: Constants.Directions.Provider | string,
			apiKey: string
		): OSFramework.Maps.OSStructures.ReturnMessage {
			// If there is already a plugin for directions, remove it and add a new one.
			this._directionsRenderer && this.dispose();

			this._buildDirectionsRenderer(Constants.Directions.Provider[provider] || provider, apiKey);
			this._providerName = provider;
			const returningMessage = new OSFramework.Maps.OSStructures.ReturnMessage();
			if (this._hasDirectionsRenderer()) {
				returningMessage.isSuccess = true;
			} else {
				returningMessage.code = OSFramework.Maps.Enum.ErrorCodes.API_FailedLoadingPlugin;
			}
			return returningMessage;
		}

		/**
		 * Sets a new route on the Map.
		 * Unlike the Google provider, the returned Promise resolves as soon as the route request starts (it doesn't wait for the route to be calculated).
		 * Routing failures (eg: no route found, network error) are reported later through the Map OnError event (LIB_FailedSetDirections),
		 * raised once per failed route. After that, the GetDistance/GetDuration methods return 0 without raising it again.
		 */
		public setRoute(
			directionOptions: OSFramework.Maps.OSStructures.Directions.Options
		): Promise<OSFramework.Maps.OSStructures.ReturnMessage> {
			let returningMessage = new OSFramework.Maps.OSStructures.ReturnMessage();

			// Validate if the directionsRenderer exists
			if (this._hasDirectionsRenderer() === false) {
				returningMessage.code = OSFramework.Maps.Enum.ErrorCodes.API_FailedNoPluginDirections;
				return new Promise((resolve) => resolve(returningMessage));
			}

			// Make sure to return an error code if the travel mode is not valid
			if (this._setTravelMode(directionOptions.travelMode) === false) {
				returningMessage.code = OSFramework.Maps.Enum.ErrorCodes.CFG_InvalidTravelMode;
				return new Promise((resolve) => resolve(returningMessage));
			}

			// Set the exclude object (Avoidance criteria)
			this._setExcludes(directionOptions.exclude);

			// Keep the totals of the route on the Map, as they are still valid if the new route can't be set
			const previousDistance = this._currentDistance;
			const previousDuration = this._currentDuration;
			//Let's make sure to reset the currentDistance and currentDuration with the values NaN.
			//By making this, we ensure any time the GetDistance and GetDuration methods get invoked, they will wait for the new route.
			this._currentDistance = NaN;
			this._currentDuration = NaN;

			this._onRouteOutcome(this._bindSetRoute);

			// Make sure the origin and the destination are both inside the waypoints array
			const waypts = [
				directionOptions.originRoute,
				...directionOptions.waypoints,
				directionOptions.destinationRoute,
			];

			// Validate coordinate from the waypoints array
			// If all the coordinates are valid, then setWaypoints on the directionsRenderer
			return this._validateCoordinates(waypts)
				.then((response) => {
					// Make sure the control is on the Map (it isn't re-added when it's already there)
					this.setState(true);
					// Setting the waypoints triggers the route request on the Plugin
					this._directionsRenderer.setWaypoints(response);
					// Remove the container that is generated by leaflet-routing-machine dependency
					// This container would overlap with the Map
					this._directionsRenderer.getContainer().remove();

					returningMessage.isSuccess = true;
					return returningMessage;
				})
				.catch((error) => {
					// The route on the Map didn't change, so restore its totals.
					// If they are known, answer the GetDistance/GetDuration calls that started waiting in the meantime,
					// otherwise a previous route request is still in progress and will answer them.
					this._currentDistance = previousDistance;
					this._currentDuration = previousDuration;
					Number.isNaN(previousDistance) === false && this._settlePendingTotals();
					returningMessage = {
						code: error.code,
						message: error.message,
					};
					return returningMessage;
				});
		}

		public setState(value: boolean): void {
			if (this._hasDirectionsRenderer()) {
				// Only change the control when the state changes, as re-adding it to the Map would trigger a route request with the previous waypoints
				if (value !== this._isEnabled) {
					if (value) {
						this._directionsRenderer.addTo(this._map.provider);
					} else {
						// Clear the waypoints while the control is still on the Map, so leaflet-routing-machine invalidates any pending route request.
						// Otherwise, the request callback would run after the control has lost its Map reference and throw an exception.
						this._directionsRenderer.setWaypoints([]);
						this._map.provider.removeControl(this._directionsRenderer as unknown as L.Control);
					}
				}
				// A cancelled route request never triggers the routesfound/routingerror events, so answer whoever is waiting for its totals
				value === false && this._settlePendingTotals();
			}
			this._isEnabled = value;
		}
	}
}
