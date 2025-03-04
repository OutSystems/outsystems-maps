// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace OutSystems.Maps.MapAPI.MarkerManager {
	const markerMap = new Map<string, string>(); //marker.uniqueId -> map.uniqueId
	const markerArr = new Array<OSFramework.Maps.Marker.IMarker>();

	/**
	 * Gets the Map to which the Marker belongs to
	 *
	 * @param {string} markerId Id of the Marker that exists on the Map
	 * @returns {*}  {MarkerMapper} this structure has the id of Map, and the reference to the instance of the Map
	 */
	function GetMapByMarkerId(markerId: string): OSFramework.Maps.OSMap.IMap {
		let map: OSFramework.Maps.OSMap.IMap;

		//markerId is the UniqueId
		if (markerMap.has(markerId)) {
			map = MapManager.GetMapById(markerMap.get(markerId), false);
		}
		//UniqueID not found
		else {
			// Try to find its reference on DOM
			const elem = OSFramework.Maps.Helper.GetElementByUniqueId(markerId, false);

			// If element is found, means that the DOM was rendered
			if (elem !== undefined) {
				//Find the closest Map
				const mapId = OSFramework.Maps.Helper.GetClosestMapId(elem);
				map = MapManager.GetMapById(mapId);
			}
		}

		return map;
	}

	/**
	 * Creates and adds a marker to a map.
	 *
	 * @export
	 * @param {string} mapId Id of the map to which the marker should be added
	 * @param {string} configs Configurations for the marker
	 * @return {*}  {string}
	 */
	export function AddMarker(mapId: string, configs: string): string {
		const responseObj = {
			isSuccess: true,
			message: 'Success',
			code: '200',
		};

		try {
			const map = MapManager.GetMapById(mapId, true);
			const markerId = OSFramework.Maps.Helper.GenerateUniqueId();
			const marker = OSFramework.Maps.Marker.MarkerFactory.MakeMarker(
				map,
				markerId,
				OSFramework.Maps.Enum.MarkerType.Marker,
				JSON.parse(configs)
			);
			markerArr.push(marker);
			markerMap.set(markerId, map.uniqueId);
			map.addMarker(marker);

			responseObj.message = markerId;
		} catch (error) {
			responseObj.isSuccess = false;
			responseObj.message = error.message;
			responseObj.code = OSFramework.Maps.Enum.ErrorCodes.API_FailedCreateMarker;
		}

		return JSON.stringify(responseObj);
	}

	/**
	 * Changes the property value of a given Marker.
	 *
	 * @export
	 * @param {string} markerId Id of the Marker to be changed
	 * @param {string} propertyName name of the property to be changed - some properties of the provider might not work out of be box
	 * @param {*} propertyValue value to which the property should be changed to.
	 */
	export function ChangeProperty(markerId: string, propertyName: string, propertyValue: unknown): void {
		const marker = GetMarkerById(markerId);
		const map = marker.map;

		if (map !== undefined) {
			map.changeMarkerProperty(markerId, propertyName, propertyValue);
		}
	}

	/**
	 * Close the Popup of the MarkerPopup
	 * @param markerId Id of the Marker
	 */
	export function ClosePopup(markerId: string): void {
		const marker = GetMarkerById(markerId) as OSFramework.Maps.Marker.IMarkerPopup;
		if (marker.hasPopup) marker.closePopup();
	}

	/**
	 * Forces the refresh of the content inside the Popup of the MarkerPopup
	 * @param markerId Id of the Marker
	 */
	export function RefreshPopup(markerId: string): void {
		const marker = GetMarkerById(markerId) as OSFramework.Maps.Marker.IMarkerPopup;
		if (marker.hasPopup) marker.refreshPopupContent();
	}

	/**
	 * Function that will remove a map marker with a given position from a cluster.
	 *
	 * @param mapId Id of the Map
	 * @param markerPosition Defines the location of the marker. Works with addresses and coordinates (latitude and longitude).
	 */
	export function RemoveMarkerFromCluster(mapId: string, markerPosition: string): string {
		const responseObj = {
			isSuccess: true,
			message: 'Success',
			code: '200',
		};

		try {
			const map = MapManager.GetMapById(mapId, true);

			// Marker Clustering is only available for GoogleMaps
			if (map.providerType === OSFramework.Maps.Enum.ProviderType.Google) {
				// Check if the feature is enabled!
				if (map.hasMarkerClusterer()) {
					const marker = map.markers.find((marker) => {
						return marker.config.location === markerPosition;
					});

					// Check if there is a marker with the given Position/Location
					if (marker !== undefined) {
						map.features.markerClusterer.removeMarker(marker);
						// eslint-disable-next-line @typescript-eslint/no-explicit-any
						(marker.provider as any).setMap(map.provider);
					} else {
						responseObj.isSuccess = false;
						responseObj.message = `There are not a marker with position:'${markerPosition}' to be removed.`;
						responseObj.code = OSFramework.Maps.Enum.ErrorCodes.API_FailedRemoveMarkerFromCluster;
					}
				} else {
					responseObj.isSuccess = false;
					responseObj.message = `Map with Id:'${mapId}' does not contain Marker Clustering.`;
					responseObj.code = OSFramework.Maps.Enum.ErrorCodes.API_FailedRemoveMarkerFromCluster;
				}
			} else {
				responseObj.isSuccess = false;
				responseObj.message = `Marker Clustering not available for '${map.providerType}' provider type.`;
				responseObj.code = OSFramework.Maps.Enum.ErrorCodes.API_FailedRemoveMarkerFromCluster;
			}
		} catch (error) {
			responseObj.isSuccess = false;
			responseObj.message = error.message;
			responseObj.code = OSFramework.Maps.Enum.ErrorCodes.API_FailedRemoveMarkerFromCluster;
		}

		return JSON.stringify(responseObj);
	}

	/**
	 * Function that will create an instance of Map object with the configurations passed
	 *
	 * @export
	 * @param {string} mapId Id of the Map where the change will occur
	 * @param {string} configs configurations for the Map in JSON format
	 * @returns {*}  {OSMap.IMarker} instance of the Map
	 */
	export function CreateMarker(mapId: string, markerId: string, configs: string): OSFramework.Maps.Marker.IMarker {
		const map = MapManager.GetMapById(mapId, true);
		if (map.providerType === OSFramework.Maps.Enum.ProviderType.Google) {
			if (!map.hasMarker(markerId)) {
				const _marker = Provider.Maps.Google.Marker.MarkerFactory.MakeMarker(
					map,
					markerId,
					OSFramework.Maps.Enum.MarkerType.Marker,
					JSON.parse(configs)
				);
				markerArr.push(_marker);
				markerMap.set(markerId, map.uniqueId);
				map.addMarker(_marker);

				return _marker;
			} else {
				throw new Error(`There is already a Marker registered on the specified Map under id:${markerId}`);
			}
		} else {
			throw new Error(`The provider type '${map.providerType}' does not support this operation.`);
		}
	}

	/**
	 * Function that will create an instance of Map object with the configurations passed
	 *
	 * @export
	 * @param {string} configs configurations for the Map in JSON format
	 * @returns {*}  {OSMap.IMarker} instance of the Map
	 */
	// eslint-disable-next-line @typescript-eslint/naming-convention
	export function CreateMarkerByUniqueID(
		markerId: string,
		markerType: OSFramework.Maps.Enum.MarkerType,
		configs: string
	): OSFramework.Maps.Marker.IMarker {
		const map = GetMapByMarkerId(markerId);
		if (!map.hasMarker(markerId)) {
			const _marker = OSFramework.Maps.Marker.MarkerFactory.MakeMarker(
				map,
				markerId,
				markerType,
				JSON.parse(configs)
			);
			markerArr.push(_marker);
			markerMap.set(markerId, map.uniqueId);
			map.addMarker(_marker);

			Events.CheckPendingEvents(_marker);
			return _marker;
		} else {
			throw new Error(`There is already a Marker registered on the specified Map under id:${markerId}`);
		}
	}

	/**
	 * Returns a Marker based on Id
	 * @param markerId Id of the Marker
	 */
	export function GetMarkerById(markerId: string, raiseError = true): OSFramework.Maps.Marker.IMarker {
		let marker: OSFramework.Maps.Marker.IMarker = markerArr.find((p) => p && p.equalsToID(markerId));

		// if didn't found marker, check if it was draw by the DrawingTools
		if (marker === undefined) {
			// Get all maps
			const allMaps = [...MapManager.GetMapsFromPage().values()];

			// On each map, look for all drawingTools and on each one look,
			// on the createdElements array, for the markerId passed.
			allMaps.find((map: OSFramework.Maps.OSMap.IMap) => {
				if (map.drawingTools) {
					marker = map.drawingTools.createdElements.find(
						(marker: OSFramework.Maps.Marker.IMarker) => marker && marker.equalsToID(markerId)
					) as OSFramework.Maps.Marker.IMarker;
				}
				return marker;
			});

			// If still wasn't found, then it does not exist - throw error
			if (marker === undefined && raiseError) {
				throw new Error(`Marker id:${markerId} not found`);
			}
		}
		return marker;
	}

	/**
	 * Open the Popup of the MarkerPopup
	 * @param markerId Id of the Marker
	 */
	export function OpenPopup(markerId: string): void {
		const marker = GetMarkerById(markerId) as OSFramework.Maps.Marker.IMarkerPopup;
		if (marker.hasPopup) marker.openPopup();
	}

	/**
	 * Function that will destroy the Marker from the current page
	 *
	 * @export
	 * @param {string} markerID id of the Marker that is about to be removed
	 */
	export function RemoveMarker(markerId: string): string {
		const responseObj = {
			isSuccess: true,
			message: 'Success',
			code: '200',
		};
		try {
			const marker = GetMarkerById(markerId);
			const map = marker.map;
			map && map.removeMarker(markerId);

			markerMap.delete(markerId);
			markerArr.splice(
				markerArr.findIndex((p) => {
					return p && p.equalsToID(markerId);
				}),
				1
			);
		} catch (error) {
			responseObj.isSuccess = false;
			responseObj.message = error.message;
			responseObj.code = OSFramework.Maps.Enum.ErrorCodes.API_FailedRemoveMarker;
		}

		return JSON.stringify(responseObj);
	}

	/**
	 * Removes all the markers of a given map.
	 *
	 * @export
	 * @param {string} mapId
	 * @return {*}  {string}
	 */
	export function RemoveAllMarkers(mapId: string, removeFromMap = true): string {
		const responseObj = {
			isSuccess: true,
			message: 'Success',
			code: '200',
		};
		try {
			if (removeFromMap) {
				// First we try to remove the markers from the map.
				MapManager.RemoveMarkers(mapId);
			}

			// Second remove the markers to destroy from local variables.
			markerMap.forEach((storedMapId, storedMarkerId) => {
				if (mapId === storedMapId) {
					markerMap.delete(storedMarkerId);
					markerArr.splice(
						markerArr.findIndex((p) => {
							return p && p.equalsToID(storedMarkerId);
						}),
						1
					);
				}
			});
		} catch (error) {
			responseObj.isSuccess = false;
			responseObj.message = error.message;
			responseObj.code = OSFramework.Maps.Enum.ErrorCodes.API_FailedRemoveMarkers;
		}

		return JSON.stringify(responseObj);
	}
}

/// Overrides for the old namespace - calls the new one, lets users know this is no longer in use

// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace MapAPI.MarkerManager {
	export function ChangeProperty(markerId: string, propertyName: string, propertyValue: unknown): void {
		OSFramework.Maps.Helper.LogWarningMessage(
			`${OSFramework.Maps.Helper.warningMessage} 'OutSystems.Maps.MapAPI.MarkerManager.ChangeProperty()'`
		);
		OutSystems.Maps.MapAPI.MarkerManager.ChangeProperty(markerId, propertyName, propertyValue);
	}

	export function ClosePopup(markerId: string): void {
		OSFramework.Maps.Helper.LogWarningMessage(
			`${OSFramework.Maps.Helper.warningMessage} 'OutSystems.Maps.MapAPI.MarkerManager.ClosePopup()'`
		);
		OutSystems.Maps.MapAPI.MarkerManager.ClosePopup(markerId);
	}

	export function RefreshPopup(markerId: string): void {
		OSFramework.Maps.Helper.LogWarningMessage(
			`${OSFramework.Maps.Helper.warningMessage} 'OutSystems.Maps.MapAPI.MarkerManager.RefreshPopup()'`
		);
		OutSystems.Maps.MapAPI.MarkerManager.RefreshPopup(markerId);
	}

	export function CreateMarker(mapId: string, markerId: string, configs: string): OSFramework.Maps.Marker.IMarker {
		OSFramework.Maps.Helper.LogWarningMessage(
			`${OSFramework.Maps.Helper.warningMessage} 'OutSystems.Maps.MapAPI.MarkerManager.CreateMarker()'`
		);
		return OutSystems.Maps.MapAPI.MarkerManager.CreateMarker(mapId, markerId, configs);
	}

	// eslint-disable-next-line @typescript-eslint/naming-convention
	export function CreateMarkerByUniqueID(
		markerId: string,
		markerType: OSFramework.Maps.Enum.MarkerType,
		configs: string
	): OSFramework.Maps.Marker.IMarker {
		OSFramework.Maps.Helper.LogWarningMessage(
			`${OSFramework.Maps.Helper.warningMessage} 'OutSystems.Maps.MapAPI.MarkerManager.CreateMarkerByUniqueID()'`
		);
		return OutSystems.Maps.MapAPI.MarkerManager.CreateMarkerByUniqueID(markerId, markerType, configs);
	}

	export function GetMarkerById(markerId: string, raiseError = true): OSFramework.Maps.Marker.IMarker {
		OSFramework.Maps.Helper.LogWarningMessage(
			`${OSFramework.Maps.Helper.warningMessage} 'OutSystems.Maps.MapAPI.MarkerManager.GetMarkerById()'`
		);
		return OutSystems.Maps.MapAPI.MarkerManager.GetMarkerById(markerId, raiseError);
	}

	export function OpenPopup(markerId: string): void {
		OSFramework.Maps.Helper.LogWarningMessage(
			`${OSFramework.Maps.Helper.warningMessage} 'OutSystems.Maps.MapAPI.MarkerManager.OpenPopup()'`
		);
		return OutSystems.Maps.MapAPI.MarkerManager.OpenPopup(markerId);
	}

	export function RemoveMarker(markerId: string): void {
		OSFramework.Maps.Helper.LogWarningMessage(
			`${OSFramework.Maps.Helper.warningMessage} 'OutSystems.Maps.MapAPI.MarkerManager.RemoveMarker()'`
		);
		OutSystems.Maps.MapAPI.MarkerManager.RemoveMarker(markerId);
	}
}
