// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace Provider.Maps.Google.Feature {
	export class Directions
		implements
			OSFramework.Maps.Feature.IDirections,
			OSFramework.Maps.Interface.IBuilder,
			OSFramework.Maps.Interface.IDisposable
	{
		private _currRouteDistance: number;
		private _currRouteLegs: Types.RoutesResponseLegStep[];
		private _currRouteTime: number;
		private _isEnabled: boolean;
		private _map: OSMap.IMapGoogle;
		private _retriveLegsFromRoute: boolean;
		private _routeRenderer: Helper.RouteRenderer;

		constructor(map: OSMap.IMapGoogle) {
			this._map = map;
			this._isEnabled = false;
			this._currRouteDistance = 0;
			this._currRouteTime = 0;
			this._currRouteLegs = [];
			this._retriveLegsFromRoute = false;
			this._routeRenderer = new Helper.RouteRenderer(map);
		}

		private get _fieldMask(): string {
			return `${Constants.GoogleMapsRouteOptions}${this._retriveLegsFromRoute ? ',routes.legs.steps' : ''}`;
		}

		/** Converts the travel mode input into a valid Google Maps travel mode. */
		private _convertTravelMode(travelModeInput: string): string {
			let travelMode = Types.TravelModes.DRIVING;
			switch (travelModeInput) {
				case 'DRIVING':
					travelMode = Types.TravelModes.DRIVING;
					break;
				case 'BICYCLING':
					travelMode = Types.TravelModes.BICYCLING;
					break;
				case 'WALKING':
					travelMode = Types.TravelModes.WALKING;
					break;
				default:
					OSFramework.Maps.Helper.LogWarningMessage(
						`The Google Maps API for Routes does not support ${travelModeInput} directions. Using DRIVING mode instead.`
					);
					break;
			}
			return travelMode;
		}

		/** Builds the request body for the Google Maps Directions API. */
		private _getRoutesRequestBody(
			directionOptions: OSFramework.Maps.OSStructures.Directions.Options
		): Types.RoutesRequestBody {
			const isOriginCoordinate = Helper.TypeChecker.IsValidCoordinates(directionOptions.originRoute);
			const isDestinationCoordinate = Helper.TypeChecker.IsValidCoordinates(directionOptions.destinationRoute);

			const requestBody: Types.RoutesRequestBody = {
				origin: {
					location: isOriginCoordinate
						? {
								latLng: Helper.Conversions.GetCoordinatesFromString(directionOptions.originRoute),
							}
						: undefined,
					address: isOriginCoordinate ? undefined : directionOptions.originRoute,
				},
				destination: {
					location: isDestinationCoordinate
						? {
								latLng: Helper.Conversions.GetCoordinatesFromString(directionOptions.destinationRoute),
							}
						: undefined,
					address: isDestinationCoordinate ? undefined : directionOptions.destinationRoute,
				},
				intermediates: this._waypointsCleanup(directionOptions.waypoints),
				travelMode: this._convertTravelMode(directionOptions.travelMode),
				routingPreference: directionOptions.travelMode === 'DRIVING' ? 'TRAFFIC_UNAWARE' : undefined,
				routeModifiers: {
					avoidTolls: directionOptions.exclude.avoidTolls,
					avoidHighways: directionOptions.exclude.avoidHighways,
					avoidFerries: directionOptions.exclude.avoidFerries,
				},
				languageCode: (this._map.config as Configuration.OSMap.GoogleMapConfig).localization.language,
				units: 'METRIC',
			};

			return requestBody;
		}

		/** Sets the route in the map based on the response from the Google Maps Routes API. */
		private _setRouteInMap(response: Types.RoutesResponse): OSFramework.Maps.OSStructures.ReturnMessage {
			if (response.routes.length > 0) {
				const firstRoute = response.routes[0];
				this._currRouteTime = parseInt(firstRoute.duration);
				this._currRouteDistance = firstRoute.distanceMeters;

				this._currRouteLegs = firstRoute.legs[0].steps;

				const result = this._routeRenderer.renderRoute(firstRoute.polyline.encodedPolyline);

				return result;
			} else {
				this._currRouteTime = 0;
				this._currRouteDistance = 0;

				return {
					code: OSFramework.Maps.Enum.ErrorCodes.LIB_FailedSetDirections,
					message: 'No routes found for the provided origin, destination and waypoints.',
				};
			}
		}

		/** Makes sure all waypoints from a list of locations (string) gets converted into a list of {location, stopover}. */
		private _waypointsCleanup(waypoints: string[]): Types.Waypoint[] {
			return waypoints.reduce((acc, curr) => {
				const isCoordinates = Helper.TypeChecker.IsValidCoordinates(curr);
				const waypoint: Types.Waypoint = this._createWaypoint(curr, true);
					location: isCoordinates
						? {
								latLng: Helper.Conversions.GetCoordinatesFromString(curr),
							}
						: undefined,
					address: isCoordinates ? undefined : curr,
					via: true,
				};
				acc.push(waypoint);
				return acc;
			}, [] as Types.Waypoint[]);
		}

		/**
		 * Sets a value indicating whether the legs from the route should be retrieved.
		 *
		 * @memberof Directions
		 */
		public set retrieveLegsFromRoute(value: boolean) {
			if (value) {
				OSFramework.Maps.Helper.LogWarningMessage(
					'By requesting the legs from the route, you will be retrieving a lot of data. This may cause higher costs of usage in the Google Maps API. Use it wisely.'
				);
			}
			this._retriveLegsFromRoute = value;
		}

		public get isEnabled(): boolean {
			return this._isEnabled;
		}

		/**
		 * Builds the Directions feature.
		 *
		 * @memberof Directions
		 */
		public build(): void {
			this.setState(this._isEnabled);
		}

		/**
		 * Disposes the Directions feature.
		 *
		 * @memberof Directions
		 */
		public dispose(): void {
			this.setState(false);
			this._map = undefined;
			this._routeRenderer.dispose();
			this._routeRenderer = undefined;
		}

		/**
		 * Gets all the legs from the current route.
		 *
		 * @return {*}  {Array<OSFramework.Maps.OSStructures.Directions.DirectionLegs>}
		 * @memberof Directions
		 */
		public getLegsFromDirection(): Array<OSFramework.Maps.OSStructures.Directions.DirectionLegs> {
			// If the Map has the directions disabled return 0 (meters)
			if (this._isEnabled === false) return [];
			if (!this._currRouteLegs || this._currRouteLegs.length === 0) return [];

			const legs = this._currRouteLegs.reduce(
				(
					acc: Array<OSFramework.Maps.OSStructures.Directions.DirectionLegs>,
					curr: Types.RoutesResponseLegStep
				) => {
					acc.push({
						origin: JSON.parse(JSON.stringify(curr.startLocation.latLng)),
						destination: JSON.parse(JSON.stringify(curr.endLocation.latLng)),
						distance: curr.distanceMeters,
						duration: parseInt(curr.staticDuration) || 0,
					});
					return acc;
				},
				[]
			);

			return legs;
		}

		/**
		 * Gets the total distance in meters from the current route.
		 *
		 * @return {*}  {Promise<number>}
		 * @memberof Directions
		 */
		public getTotalDistanceFromDirection(): Promise<number> {
			return new Promise((resolve) => {
				// If no route has been set before requesting the distance return 0 (meters)
				if (this._isEnabled === false) resolve(0);

				resolve(this._currRouteDistance);
			});
		}

		/**
		 * Gets the total duration in seconds from the current route.
		 *
		 * @return {*}  {Promise<number>}
		 * @memberof Directions
		 */
		public getTotalDurationFromDirection(): Promise<number> {
			return new Promise((resolve) => {
				// If no route has been set before requesting the duration return 0 (meters)
				if (this._isEnabled === false) resolve(0);

				resolve(this._currRouteTime);
			});
		}

		/**
		 * Removes the current route from the map.
		 *
		 * @return {*}  {OSFramework.Maps.OSStructures.ReturnMessage}
		 * @memberof Directions
		 */
		public removeRoute(): OSFramework.Maps.OSStructures.ReturnMessage {
			this.setState(false);

			return {
				isSuccess: true,
			};
		}

		/**
		 * SetPlugin for GoogleMaps provider is not needed.
		 *
		 * @param {string} providerName
		 * @param {string} apiKey
		 * @return {*}  {OSFramework.Maps.OSStructures.ReturnMessage}
		 * @memberof Directions
		 */
		public setPlugin(
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			providerName: string,
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			apiKey: string
		): OSFramework.Maps.OSStructures.ReturnMessage {
			OSFramework.Maps.Helper.ThrowError(
				this._map,
				OSFramework.Maps.Enum.ErrorCodes.GEN_NoPluginDirectionsNeeded
			);
			return;
		}

		/**
		 * Sets the route in the map based on the provided direction options.
		 *
		 * @param {OSFramework.Maps.OSStructures.Directions.Options} directionOptions
		 * @return {*}  {Promise<OSFramework.Maps.OSStructures.ReturnMessage>}
		 * @memberof Directions
		 */
		public setRoute(
			directionOptions: OSFramework.Maps.OSStructures.Directions.Options
		): Promise<OSFramework.Maps.OSStructures.ReturnMessage> {
			const routeSetPromise = new Promise<OSFramework.Maps.OSStructures.ReturnMessage>((resolve, reject) => {
				// Fetch the Google Maps Routes API to get the route based on the provided options
				fetch(Constants.googleMapsRoutesApiURL, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						'X-Goog-Api-Key': this._map.config.apiKey,
						'X-Goog-FieldMask': this._fieldMask,
					},
					body: JSON.stringify(this._getRoutesRequestBody(directionOptions)),
				})
					.then((response) => {
						if (response.status !== 200) {
							response
								.json()
								.then((responseJSON) => {
									const result = this._setRouteInMap(responseJSON);

									if (result.isSuccess) {
										this.setState(true);
										resolve(result);
									} else {
										this.setState(false);
										reject(result);
									}
								})
								// Else, we want to return the reason
								.catch((reason: string) => {
									this.setState(false);
									reject({
										code: OSFramework.Maps.Enum.ErrorCodes.LIB_FailedSetDirections,
										message: `${reason}`,
									});
								});
						} else {
							reject({
								code: OSFramework.Maps.Enum.ErrorCodes.LIB_FailedSetDirections,
								message: response.statusText,
							});
						}
					})
					// Else, we want to return the reason
					.catch((reason: string) => {
						this.setState(false);
						reject({
							code: OSFramework.Maps.Enum.ErrorCodes.LIB_FailedSetDirections,
							message: `${reason}`,
						});
					});
			});

			return routeSetPromise;
		}

		/**
		 * Sets the state of the Directions feature.
		 *
		 * @param {boolean} value
		 * @memberof Directions
		 */
		public setState(value: boolean): void {
			if (!value) {
				this._routeRenderer.removeRoute();
				this._currRouteLegs = [];
				this._currRouteDistance = 0;
				this._currRouteTime = 0;
			}
			this._isEnabled = value;
		}
	}
}
