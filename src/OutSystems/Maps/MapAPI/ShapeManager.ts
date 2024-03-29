// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace OutSystems.Maps.MapAPI.ShapeManager {
	const shapeMap = new Map<string, string>(); //shape.uniqueId -> map.uniqueId
	const shapeArr = new Array<OSFramework.Maps.Shape.IShape>();

	/**
	 * Changes the property value of a given Shape.
	 *
	 * @export
	 * @param {string} shapeId Id of the Shape to be changed
	 * @param {string} propertyName name of the property to be changed - some properties of the provider might not work out of be box
	 * @param {*} propertyValue value to which the property should be changed to.
	 */
	export function ChangeProperty(shapeId: string, propertyName: string, propertyValue: unknown): void {
		const shape = GetShapeById(shapeId);
		const map = shape.map;

		if (map !== undefined) {
			map.changeShapeProperty(shapeId, propertyName, propertyValue);
		}
	}

	/**
	 * Function that will create an instance of Shape object with the configurations passed
	 *
	 * @export
	 * @param {string} configs configurations for the Shape in JSON format
	 * @returns {*}  {Shape.IShape} instance of the Shape
	 */
	export function CreateShape(
		shapeId: string,
		shapeType: OSFramework.Maps.Enum.ShapeType,
		configs: string
	): OSFramework.Maps.Shape.IShape {
		const map = GetMapByShapeId(shapeId);
		if (!map.hasShape(shapeId)) {
			const _shape = OSFramework.Maps.Shape.ShapeFactory.MakeShape(map, shapeId, shapeType, JSON.parse(configs));
			shapeArr.push(_shape);
			shapeMap.set(shapeId, map.uniqueId);
			map.addShape(_shape);

			Events.CheckPendingEvents(_shape);
			return _shape;
		} else {
			throw new Error(`There is already a Shape registered on the specified Map under id:${shapeId}`);
		}
	}

	/**
	 * Returns a set of properties from the Circle shape based on its WidgetId
	 * @param shapeId Id of the Shape
	 */
	export function GetCircle(shapeId: string): string {
		const shape = GetShapeById(shapeId) as OSFramework.Maps.Shape.IShapeCircle;
		const properties = new OSFramework.Maps.OSStructures.API.CircleProperties();
		if (shape.type === OSFramework.Maps.Enum.ShapeType.Circle) {
			properties.Center = {
				Lat: shape.providerCenter.lat as number,
				Lng: shape.providerCenter.lng as number,
			};
			properties.Radius = shape.providerRadius;
		} else {
			OSFramework.Maps.Helper.ThrowError(
				shape.map,
				OSFramework.Maps.Enum.ErrorCodes.API_FailedGettingCircleShape
			);
		}
		// If properties are empty/undefined, then we want to stringify an empty string
		return JSON.stringify(properties || '');
	}

	/**
	 * Gets the Map to which the Shape belongs to
	 *
	 * @param {string} shapeId Id of the Shape that exists on the Map
	 * @returns {*}  {ShapeMapper} this structure has the id of Map, and the reference to the instance of the Map
	 */
	function GetMapByShapeId(shapeId: string): OSFramework.Maps.OSMap.IMap {
		let map: OSFramework.Maps.OSMap.IMap;

		//shapeId is the UniqueId
		if (shapeMap.has(shapeId)) {
			map = MapManager.GetMapById(shapeMap.get(shapeId), false);
		}
		//UniqueID not found
		else {
			// Try to find its reference on DOM
			const elem = OSFramework.Maps.Helper.GetElementByUniqueId(shapeId, false);

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
	 * Returns a Shape based on Id
	 * @param shapeId Id of the Shape
	 */
	export function GetShapeById(shapeId: string, raiseError = true): OSFramework.Maps.Shape.IShape {
		let shape: OSFramework.Maps.Shape.IShape = shapeArr.find((p) => p && p.equalsToID(shapeId));

		// if didn't found shape, check if it was draw by the DrawingTools
		if (shape === undefined) {
			// Get all maps
			const allMaps = [...MapManager.GetMapsFromPage().values()];

			// On each map, look for all drawingTools and on each one look, on the createdElements array, for the shapeId passed
			allMaps.find((map: OSFramework.Maps.OSMap.IMap) => {
				return (shape =
					map.drawingTools &&
					(map.drawingTools.createdElements.find((shape: OSFramework.Maps.Shape.IShape) =>
						shape.equalsToID(shapeId)
					) as OSFramework.Maps.Shape.IShape));
			});

			// If still wasn't found, then it does not exist and throw error
			if (shape === undefined && raiseError) {
				throw new Error(`Shape id:${shapeId} not found`);
			}
		}
		return shape;
	}

	/**
	 * Returns a Shape path based on the WidgetId of the shape
	 * Doesn't work for shapes like the Circle
	 * @param shapeId Id of the Shape
	 */
	export function GetShapePath(shapeId: string): string {
		const shape = GetShapeById(shapeId) as OSFramework.Maps.Shape.IShapePolyshape;
		const providerPath = shape.providerPath;
		let shapePath = [];
		if (providerPath !== undefined) {
			shapePath = providerPath.map((coords: OSFramework.Maps.OSStructures.OSMap.Coordinates) => {
				return { Lat: coords.lat, Lng: coords.lng };
			});
		} else {
			OSFramework.Maps.Helper.ThrowError(shape.map, OSFramework.Maps.Enum.ErrorCodes.API_FailedGettingShapePath);
		}

		return JSON.stringify(shapePath);
	}

	/**
	 * Function that will destroy the Shape from the current page
	 *
	 * @export
	 * @param {string} shapeId id of the Shape that is about to be removed
	 */
	export function RemoveShape(shapeId: string): void {
		const shape = GetShapeById(shapeId);
		const map = shape.map;

		map && map.removeShape(shapeId);
		shapeMap.delete(shapeId);
		shapeArr.splice(
			shapeArr.findIndex((p) => {
				return p && p.equalsToID(shapeId);
			}),
			1
		);
	}

	/**
	 * Function that will returns if a marker is inside a shape (Circle, Rectangle or Polygon)
	 *
	 * @export
	 * @param {string} shapeId id of the Shape that is about to be removed
	 */
	export function ContainsLocation(
		mapId: string,
		shapeId: string,
		pointCoordinates: string,
		coordinatesList: string
	): string {
		const map = MapManager.GetMapById(mapId, true);
		const containsLocationResponse = map.features.shape.containsLocation(
			mapId,
			shapeId,
			pointCoordinates,
			coordinatesList
		);
		return JSON.stringify(containsLocationResponse);
	}
}

/// Overrides for the old namespace - calls the new one, lets users know this is no longer in use

// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace MapAPI.ShapeManager {
	export function ChangeProperty(shapeId: string, propertyName: string, propertyValue: unknown): void {
		OSFramework.Maps.Helper.LogWarningMessage(
			`${OSFramework.Maps.Helper.warningMessage} 'OutSystems.Maps.MapAPI.ShapeManager.ChangeProperty()'`
		);
		OutSystems.Maps.MapAPI.ShapeManager.ChangeProperty(shapeId, propertyName, propertyValue);
	}

	// eslint-disable-next-line @typescript-eslint/naming-convention
	export function CreateShape(
		shapeId: string,
		shapeType: OSFramework.Maps.Enum.ShapeType,
		configs: string
	): OSFramework.Maps.Shape.IShape {
		OSFramework.Maps.Helper.LogWarningMessage(
			`${OSFramework.Maps.Helper.warningMessage} 'OutSystems.Maps.MapAPI.ShapeManager.CreateShape()'`
		);
		return OutSystems.Maps.MapAPI.ShapeManager.CreateShape(shapeId, shapeType, configs);
	}

	export function GetCircle(shapeId: string): string {
		OSFramework.Maps.Helper.LogWarningMessage(
			`${OSFramework.Maps.Helper.warningMessage} 'OutSystems.Maps.MapAPI.ShapeManager.GetCircle()'`
		);
		return OutSystems.Maps.MapAPI.ShapeManager.GetCircle(shapeId);
	}

	export function GetShapeById(shapeId: string, raiseError = true): OSFramework.Maps.Shape.IShape {
		OSFramework.Maps.Helper.LogWarningMessage(
			`${OSFramework.Maps.Helper.warningMessage} 'OutSystems.Maps.MapAPI.ShapeManager.GetShapeById()'`
		);

		return OutSystems.Maps.MapAPI.ShapeManager.GetShapeById(shapeId, raiseError);
	}

	export function GetShapePath(shapeId: string): string {
		OSFramework.Maps.Helper.LogWarningMessage(
			`${OSFramework.Maps.Helper.warningMessage} 'OutSystems.Maps.MapAPI.ShapeManager.GetShapePath()'`
		);
		return OutSystems.Maps.MapAPI.ShapeManager.GetShapePath(shapeId);
	}

	export function RemoveShape(shapeId: string): void {
		OSFramework.Maps.Helper.LogWarningMessage(
			`${OSFramework.Maps.Helper.warningMessage} 'OutSystems.Maps.MapAPI.ShapeManager.RemoveShape()'`
		);
		OutSystems.Maps.MapAPI.ShapeManager.RemoveShape(shapeId);
	}
}
