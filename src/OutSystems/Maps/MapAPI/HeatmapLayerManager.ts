// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace OutSystems.Maps.MapAPI.HeatmapLayerManager {
	const heatmapLayerMap = new Map<string, string>(); //heatmapLayer.uniqueId -> map.uniqueId
	const heatmapLayerArr = new Array<OSFramework.Maps.HeatmapLayer.IHeatmapLayer>();
	let _internalUseDeckgl = true;

	/**
	 * Gets the Map to which the HeatmapLayer belongs to
	 *
	 * @param {string} heatmapLayerId Id of the HeatmapLayer that exists on the Map
	 */
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
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
	 * @returns {*}  {HeatmapLayer.IHeatmapLayer} instance of the HeatmapLayer
	 */
	// eslint-disable-next-line @typescript-eslint/naming-convention
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
			let heatmapFactory = Provider.Layers.deckgl.HeatmapLayer.HeatmapLayerFactory.MakeHeatmapLayer;

			if (!_internalUseDeckgl) {
				heatmapFactory = Provider.Maps.Google.HeatmapLayer.HeatmapLayerFactory.MakeHeatmapLayer;
			}

			const _heatmapLayer = heatmapFactory(map, heatmapLayerId, JSON.parse(configs));
			heatmapLayerArr.push(_heatmapLayer);
			heatmapLayerMap.set(heatmapLayerId, map.uniqueId);
			map.addHeatmapLayer(_heatmapLayer);

			return _heatmapLayer;
		} else {
			console.error(
				`There is already a HeatmapLayer registered on the specified Map under id: %s`,
				heatmapLayerId
			);
		}
	}

	/**
	 * Returns a HeatmapLayer element based on Id
	 *
	 * @export
	 * @param heatmapLayerId Id of the HeatmapLayer
	 */
	export function GetHeatmapLayerById(
		heatmapLayerId: string,
		raiseError = true
	): OSFramework.Maps.HeatmapLayer.IHeatmapLayer {
		const heatmapLayer: OSFramework.Maps.HeatmapLayer.IHeatmapLayer = heatmapLayerArr.find(
			(p) => p && p.equalsToID(heatmapLayerId)
		);

		if (heatmapLayer === undefined && raiseError) {
			throw new Error(`Marker id:${heatmapLayerId} not found`);
		}

		return heatmapLayer;
	}

	/**
	 * Function that will destroy the HeatmapLayer from the map it belongs to
	 * @export
	 * @param {string} heatmapLayerId id of the HeatmapLayer that is about to be removed
	 */
	export function RemoveHeatmapLayer(heatmapLayerId: string): void {
		const heatmapLayer = GetHeatmapLayerById(heatmapLayerId);
		const map = heatmapLayer.map;

		map && map.removeHeatmapLayer(heatmapLayerId);
		heatmapLayerMap.delete(heatmapLayerId);
		heatmapLayerArr.splice(
			heatmapLayerArr.findIndex((p) => {
				return p && p.equalsToID(heatmapLayerId);
			}),
			1
		);
	}

	/**
	 * Sets the internal use of deck.gl for the HeatmapLayerManager.
	 * This is only applicable for the Google provider, and enable the
	 * use of the Google provider for the HeatmapLayer, instead of the
	 * default deck.gl provider.
	 *
	 * @param {boolean} useDeckgl true if the HeatmapLayerManager should use deck.gl, false otherwise
	 */
	export function SetUseDeckgl(useDeckgl = true): void {
		const gmversion = Number(Provider.Maps.Google.Version.Get());
		if (!Number.isNaN(gmversion)) {
			if (useDeckgl) {
				// Explicitly use deck.gl, regardless of Google Maps version
				_internalUseDeckgl = true;
			} else if (gmversion >= 3.65) {
				// Google Maps Heatmap are deprecated/unsupported from this version onwards,
				// so fall back to deck.gl and warn the developer.
				console.warn(
					`The Google Maps version %s does not support the use of DrawingTools. Falling back to deck.gl provider instead.`,
					gmversion,
					'https://developers.google.com/maps/deprecations#heatmap-layer-js-deprecation'
				);
				_internalUseDeckgl = true;
			} else {
				// Google Maps DrawingTools are supported and deck.gl was disabled
				_internalUseDeckgl = false;
			}
		}
	}
}

/// Overrides for the old namespace - calls the new one, lets users know this is no longer in use

// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace MapAPI.HeatmapLayerManager {
	export function ChangeProperty(heatmapLayerId: string, propertyName: string, propertyValue: unknown): void {
		OSFramework.Maps.Helper.LogWarningMessage(
			`${OSFramework.Maps.Helper.warningMessage} 'OutSystems.Maps.MapAPI.HeatmapLayerManager.ChangeProperty()'`
		);
		OutSystems.Maps.MapAPI.HeatmapLayerManager.ChangeProperty(heatmapLayerId, propertyName, propertyValue);
	}

	export function CreateHeatmapLayer(
		heatmapLayerId: string,
		configs: string
	): OSFramework.Maps.HeatmapLayer.IHeatmapLayer {
		OSFramework.Maps.Helper.LogWarningMessage(
			`${OSFramework.Maps.Helper.warningMessage} 'OutSystems.Maps.MapAPI.HeatmapLayerManager.CreateHeatmapLayer()'`
		);
		return OutSystems.Maps.MapAPI.HeatmapLayerManager.CreateHeatmapLayer(heatmapLayerId, configs);
	}

	export function GetHeatmapLayerById(
		heatmapLayerId: string,
		raiseError = true
	): OSFramework.Maps.HeatmapLayer.IHeatmapLayer {
		OSFramework.Maps.Helper.LogWarningMessage(
			`${OSFramework.Maps.Helper.warningMessage} 'OutSystems.Maps.MapAPI.HeatmapLayerManager.GetHeatmapLayerById()'`
		);

		return OutSystems.Maps.MapAPI.HeatmapLayerManager.GetHeatmapLayerById(heatmapLayerId, raiseError);
	}

	export function RemoveHeatmapLayer(heatmapLayerId: string): void {
		OSFramework.Maps.Helper.LogWarningMessage(
			`${OSFramework.Maps.Helper.warningMessage} 'OutSystems.Maps.MapAPI.HeatmapLayerManager.RemoveHeatmapLayer()'`
		);
		OutSystems.Maps.MapAPI.HeatmapLayerManager.RemoveHeatmapLayer(heatmapLayerId);
	}
}
