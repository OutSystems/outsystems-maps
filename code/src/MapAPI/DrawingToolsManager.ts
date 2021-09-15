// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace MapAPI.DrawingToolsManager {
    const drawingToolsMap = new Map<string, string>(); //drawingTools.uniqueId -> map.uniqueId
    let drawingToolsElement = undefined;

    /**
     * Gets the Map to which the DrawingTools belongs to
     *
     * @param {string} drawingToolsId Id of the DrawingTools that exists on the Map
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    function GetMapByDrawingToolsId(
        drawingToolsId: string
    ): OSFramework.OSMap.IMap {
        let map: OSFramework.OSMap.IMap;

        //drawingToolsId is the UniqueId
        if (drawingToolsMap.has(drawingToolsId)) {
            map = MapManager.GetMapById(
                drawingToolsMap.get(drawingToolsId),
                false
            );
        }
        //UniqueID not found
        else {
            // Try to find its reference on DOM
            const elem = OSFramework.Helper.GetElementByUniqueId(
                drawingToolsId,
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
     * Changes the property value of a given DrawingTools.
     *
     * @export
     * @param {string} drawingToolsId Id of the DrawingTools to be changed
     * @param {string} propertyName name of the property to be changed - some properties of the provider might not work out of be box
     * @param {*} propertyValue value to which the property should be changed to.
     */
    export function ChangeProperty(
        drawingToolsId: string,
        propertyName: string,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
        propertyValue: any
    ): void {
        const drawingTools = GetDrawingToolsById(drawingToolsId);
        const map = drawingTools.map;

        if (map !== undefined) {
            map.changeDrawingToolsProperty(
                drawingToolsId,
                propertyName,
                propertyValue
            );
        }
    }

    /**
     * Function that will create an instance of DrawingTools object with the configurations passed
     *
     * @export
     * @param {string} configs configurations for the DrawingTools in JSON format
     * @returns {*}  {DrawingTools.IDrawingTools} instance of the DrawingTools
     */
    // eslint-disable-next-line @typescript-eslint/naming-convention
    export function CreateDrawingTools(
        drawingToolsId: string,
        configs: string
    ): OSFramework.DrawingTools.IDrawingTools {
        const map = GetMapByDrawingToolsId(drawingToolsId);
        if (!map.drawingTools) {
            const _drawingTools = GoogleProvider.DrawingTools.DrawingToolsFactory.MakeDrawingTools(
                map,
                drawingToolsId,
                JSON.parse(configs)
            );
            drawingToolsElement = _drawingTools;
            drawingToolsMap.set(drawingToolsId, map.uniqueId);
            map.addDrawingTools(_drawingTools);

            return _drawingTools;
        } else {
            console.error(
                `There is already a DrawingTools registered on the specified Map under id:${drawingToolsId}`
            );
        }
    }

    /**
     * Returns a DrawingTools element based on Id
     *
     * @export
     * @param drawingToolsId Id of the DrawingTools
     */
    export function GetDrawingToolsById(
        drawingToolsId: string,
        raiseError = true
    ): OSFramework.DrawingTools.IDrawingTools {
        const drawingTools: OSFramework.DrawingTools.IDrawingTools =
            drawingToolsElement &&
            drawingToolsElement.equalsToID(drawingToolsId)
                ? drawingToolsElement
                : undefined;
        if (drawingTools === undefined && raiseError) {
            throw new Error(`DrawingTools id:${drawingToolsId} not found`);
        }

        return drawingTools;
    }

    /**
     * Function that will destroy the DrawingTools from the map it belongs to
     * @export
     * @param {string} drawingToolsId id of the DrawingTools that is about to be removed
     */
    export function RemoveDrawingTools(drawingToolsId: string): void {
        const drawingTools = GetDrawingToolsById(drawingToolsId);
        const map = drawingTools.map;

        map && map.removeDrawingTools(drawingToolsId);
        drawingToolsMap.delete(drawingToolsId);
        drawingToolsElement = undefined;
    }
}
