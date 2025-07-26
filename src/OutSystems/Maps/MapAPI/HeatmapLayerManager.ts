// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace OutSystems.Maps.MapAPI.HeatmapLayerManager {
	/**
	 * Map that will store the HeatmapLayer uniqueId and the Map uniqueId to which it belongs to.
	 */
	const heatmapLayerMap = new Map<string, string>(); //heatmapLayer.uniqueId -> map.uniqueId

	/**
	 * Array that will store the HeatmapLayer instances.
	 */
	const heatmapLayerArr = new Array<OSFramework.Maps.HeatmapLayer.IHeatmapLayer>();

	/**
	 * Gets the Map to which the HeatmapLayer belongs to
	 *
	 * @param {string} heatmapLayerId Id of the HeatmapLayer that exists on the Map
	 * @returns {OSFramework.Maps.OSMap.IMap} The Map instance to which the HeatmapLayer belongs to.
	 */
	function GetMapByHeatmapLayerId(heatmapLayerId: string): OSFramework.Maps.OSMap.IMap {
		let map: OSFramework.Maps.OSMap.IMap;

		//heatmapLayerId is the UniqueId
		if (heatmapLayerMap.has(heatmapLayerId)) {
			map = MapManager.GetMapById(heatmapLayerMap.get(heatmapLayerId), false);
		}
		//UniqueID not found
		else {
			// Try to find its reference on DOM
			const elem = OSFramework.Maps.Helper.GetElementByUniqueId(heatmapLayerId, false);

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
	 * Changes the property value of a given HeatmapLayer.
	 *
	 * @export
	 * @param {string} heatmapLayerId Id of the HeatmapLayer to be changed
	 * @param {string} propertyName name of the property to be changed - some properties of the provider might not work out of be box
	 * @param {*} propertyValue value to which the property should be changed to.
	 * @returns {void}
	 */
	export function ChangeProperty(heatmapLayerId: string, propertyName: string, propertyValue: unknown): void {
		const heatmapLayer = GetHeatmapLayerById(heatmapLayerId);
		const map = heatmapLayer.map;

		if (map !== undefined) {
			map.changeHeatmapLayerProperty(heatmapLayerId, propertyName, propertyValue);
		}
	}

	/**
	 * Function that will create an instance of HeatmapLayer object with the configurations passed
	 *
	 * @export
	 * @param {string} configs configurations for the HeatmapLayer in JSON format
	 * @returns {OSFramework.Maps.HeatmapLayer.IHeatmapLayer} instance of the HeatmapLayer
	 */
	export function CreateHeatmapLayer(
		heatmapLayerId: string,
		configs: string
	): OSFramework.Maps.HeatmapLayer.IHeatmapLayer {
		const map = GetMapByHeatmapLayerId(heatmapLayerId);
		if (
			OSFramework.Maps.Helper.ValidateFeatureProvider(map, OSFramework.Maps.Enum.Feature.HeatmapLayer) === false
		) {
			return;
		}
		if (!map.hasHeatmapLayer(heatmapLayerId)) {
			const _heatmapLayer = Provider.Maps.Google.HeatmapLayer.HeatmapLayerFactory.MakeHeatmapLayer(
				map,
				heatmapLayerId,
				JSON.parse(configs)
			);
			heatmapLayerArr.push(_heatmapLayer);
			heatmapLayerMap.set(heatmapLayerId, map.uniqueId);
			map.addHeatmapLayer(_heatmapLayer);

			return _heatmapLayer;
		} else {
			console.error(`There is already a HeatmapLayer registered on the specified Map under id:${heatmapLayerId}`);
		}
	}

	/**
	 * Returns a HeatmapLayer element based on Id
	 *
	 * @export
	 * @param heatmapLayerId Id of the HeatmapLayer
	 * @param {boolean} raiseError Whether to throw an error if the HeatmapLayer is not found.
	 * @returns {OSFramework.Maps.HeatmapLayer.IHeatmapLayer} The HeatmapLayer instance.
	 */
	export function GetHeatmapLayerById(
		heatmapLayerId: string,
		raiseError = true
	): OSFramework.Maps.HeatmapLayer.IHeatmapLayer {
		const heatmapLayer = heatmapLayerArr.find((p) => p?.equalsToID(heatmapLayerId));

		if (heatmapLayer === undefined && raiseError) {
			throw new Error(`Marker id:${heatmapLayerId} not found`);
		}

		return heatmapLayer;
	}

	/**
	 * Function that will destroy the HeatmapLayer from the map it belongs to
	 * @export
	 * @param {string} heatmapLayerId id of the HeatmapLayer that is about to be removed
	 * @returns {void}
	 */
	export function RemoveHeatmapLayer(heatmapLayerId: string): void {
		const heatmapLayer = GetHeatmapLayerById(heatmapLayerId);
		const map = heatmapLayer.map;

		map?.removeHeatmapLayer(heatmapLayerId);
		heatmapLayerMap.delete(heatmapLayerId);
		heatmapLayerArr.splice(
			heatmapLayerArr.findIndex((p) => {
				return p?.equalsToID(heatmapLayerId);
			}),
			1
		);
	}
}
