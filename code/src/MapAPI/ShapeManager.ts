// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace MapAPI.ShapeManager {
    const shapeMap = new Map<string, string>(); //shape.uniqueId -> map.uniqueId
    const shapeArr = new Array<OSFramework.Shape.IShape>();

    /**
     * Changes the property value of a given Shape.
     *
     * @export
     * @param {string} shapeId Id of the Shape to be changed
     * @param {string} propertyName name of the property to be changed - some properties of the provider might not work out of be box
     * @param {*} propertyValue value to which the property should be changed to.
     */
    export function ChangeProperty(
        shapeId: string,
        propertyName: string,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
        propertyValue: any
    ): void {
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
    // eslint-disable-next-line @typescript-eslint/naming-convention
    export function CreateShape(
        shapeId: string,
        shapeType: OSFramework.Enum.ShapeType,
        configs: string
    ): OSFramework.Shape.IShape {
        const map = GetMapByShapeId(shapeId);
        if (!map.hasShape(shapeId)) {
            const _shape = GoogleProvider.Shape.ShapeFactory.MakeShape(
                map,
                shapeId,
                shapeType,
                JSON.parse(configs)
            );
            shapeArr.push(_shape);
            shapeMap.set(shapeId, map.uniqueId);
            map.addShape(_shape);

            // shapes.set(shapeId, _shape);
            Events.CheckPendingEvents(_shape);
            return _shape;
        } else {
            throw new Error(
                `There is already a Shape registered on the specified Map under id:${shapeId}`
            );
        }
    }

    /**
     * Returns a set of properties from the Circle shape based on its WidgetId
     * @param shapeId Id of the Shape
     */
    export function GetCircle(shapeId: string): string {
        const shape = GetShapeById(shapeId);
        const properties = {
            center: undefined,
            radius: undefined
        };
        if (shape.type !== OSFramework.Enum.ShapeType.Circle) {
            OSFramework.Helper.ThrowError(
                shape.map,
                OSFramework.Enum.ErrorCodes.API_FailedGettingCircleShape
            );
        } else {
            properties.center = shape.providerCenter;
            properties.radius = shape.providerRadius;
        }
        return JSON.stringify(properties);
    }

    /**
     * Gets the Map to which the Shape belongs to
     *
     * @param {string} shapeId Id of the Shape that exists on the Map
     * @returns {*}  {ShapeMapper} this structure has the id of Map, and the reference to the instance of the Map
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    function GetMapByShapeId(shapeId: string): OSFramework.OSMap.IMap {
        let map: OSFramework.OSMap.IMap;

        //shapeId is the UniqueId
        if (shapeMap.has(shapeId)) {
            map = MapManager.GetMapById(shapeMap.get(shapeId), false);
        }
        //UniqueID not found
        else {
            // Try to find its reference on DOM
            const elem = OSFramework.Helper.GetElementByUniqueId(
                shapeId,
                false
            );

            // If element is found, means that the DOM was rendered
            if (elem !== undefined) {
                //Find the closest Map
                const mapId = OSFramework.Helper.GetClosestMapId(elem);
                map = MapManager.GetMapById(mapId);
            }
        }

        return map;
    }

    /**
     * Returns a Shape based on Id
     * @param shapeId Id of the Shape
     */
    export function GetShapeById(shapeId: string): OSFramework.Shape.IShape {
        return shapeArr.find((p) => p && p.equalsToID(shapeId));
    }

    /**
     * Returns a Shape path based on the WidgetId of the shape
     * Doesn't work for shapes like the Circle
     * @param shapeId Id of the Shape
     */
    export function GetShapePath(shapeId: string): string {
        const shape = GetShapeById(shapeId);
        return JSON.stringify(shape.providerPath);
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
}
