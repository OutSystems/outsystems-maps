// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace OutSystems.Maps.MapAPI.DrawingToolsManager {
    const drawingToolsMap = new Map<string, string>(); //drawingTools.uniqueId -> map.uniqueId
    let drawingToolsElement = undefined;

    /* pending tools map holds the tools to be created if the drawing tools block is not ready to add new tools */
    const _pendingTools = new Map<
        string,
        Array<OSFramework.Maps.OSStructures.API.PendingTools>
    >(); //drawingTools.uniqueId -> Array<tool.uniqueId, tool.type, tool.configs>

    function CreateTool(
        drawingTools: OSFramework.Maps.DrawingTools.IDrawingTools,
        toolId: string,
        type: OSFramework.Maps.Enum.DrawingToolsTypes,
        configs: string
    ): OSFramework.Maps.DrawingTools.ITool {
        if (
            !drawingTools.hasTool(toolId) &&
            !drawingTools.toolAlreadyExists(type)
        ) {
            const _tool =
                OSFramework.Maps.DrawingTools.DrawingToolsFactory.MakeTool(
                    drawingTools.map,
                    drawingTools,
                    toolId,
                    type,
                    JSON.parse(configs)
                );
            drawingTools.addTool(_tool);
            Events.CheckPendingEvents(drawingTools);
            return _tool;
        } else {
            OSFramework.Maps.Helper.ThrowError(
                drawingTools.map,
                OSFramework.Maps.Enum.ErrorCodes.GEN_ToolTypeAlreadyExists,
                type
            );
        }
    }

    /**
     * Gets the Map to which the DrawingTools belongs to
     *
     * @param {string} drawingToolsId Id of the DrawingTools that exists on the Map
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    function GetMapByDrawingToolsId(
        drawingToolsId: string
    ): OSFramework.Maps.OSMap.IMap {
        let map: OSFramework.Maps.OSMap.IMap;

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
            const elem = OSFramework.Maps.Helper.GetElementByUniqueId(
                drawingToolsId,
                false
            );

            // If element is found, means that the DOM was rendered
            if (elem !== undefined) {
                //Find the closest Map
                const mapId = OSFramework.Maps.Helper.GetClosestMapId(elem);
                map = OutSystems.Maps.MapAPI.MapManager.GetMapById(mapId);
            }
        }

        return map;
    }

    /**
     * Function that will create an instance of a Tool object with the configurations passed
     * (If the DrawingTools Block to which the Tool belongs is not created, adds the tool into a pending list)
     *
     * @param toolId identifier of the new tool
     * @param type type of the new tool (OSFramework.Maps.Enum.DrawingToolsTypes)
     * @param configs stringified configuration for the new tool
     */
    export function AddTool(
        toolId: string,
        type: OSFramework.Maps.Enum.DrawingToolsTypes,
        configs: string
    ): OSFramework.Maps.DrawingTools.ITool {
        // Let's make sure that if the Map doesn't exist, we don't throw and exception but instead add the handler to the pendingEvents
        const drawingToolsId = GetDrawingToolsByToolUniqueId(toolId);
        const drawingTools = GetDrawingToolsById(drawingToolsId, false);
        if (drawingTools !== undefined) {
            return CreateTool(drawingTools, toolId, type, configs);
        } else {
            // If the drawingTools block is not created then add the tool into a pendingTools Map.
            if (_pendingTools.has(drawingToolsId)) {
                _pendingTools
                    .get(drawingToolsId)
                    .push({ toolId, type, configs });
            } else {
                _pendingTools.set(drawingToolsId, [{ toolId, type, configs }]);
            }
        }
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
     * Changes the property value of a given Tool from the DrawingTools it belongs to
     *
     * @export
     * @param {string} toolId Id of the Tool to be changed
     * @param {string} propertyName name of the property to be changed - some properties of the provider might not work out of be box
     * @param {*} propertyValue value to which the property should be changed to.
     */
    export function ChangeToolProperty(
        toolId: string,
        propertyName: string,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
        propertyValue: any
    ): void {
        const drawingToolsId = GetDrawingToolsByToolUniqueId(toolId);
        const drawingTools = GetDrawingToolsById(drawingToolsId, false);

        if (drawingTools !== undefined) {
            drawingTools.changeToolProperty(
                toolId,
                propertyName,
                propertyValue
            );
        }
    }

    /**
     * API method to check if there are pending tools waiting for a specific DrawingTools
     *
     * @export
     * @param {string} drawingTools DrawingTools that is ready for events
     */
    export function CheckPendingTools(
        drawingTools: OSFramework.Maps.DrawingTools.IDrawingTools
    ): void {
        // For each key of the pendingEvents check if the shape has the key as a widgetId or uniqueId and add the new handler
        for (const key of _pendingTools.keys()) {
            if (drawingTools.equalsToID(key)) {
                _pendingTools.get(key).forEach((tool) => {
                    CreateTool(
                        drawingTools,
                        tool.toolId,
                        tool.type,
                        tool.configs
                    );
                });
                drawingTools.refreshProviderEvents();
                // Make sure to delete the entry from the pendingEvents
                _pendingTools.delete(key);
            }
        }
    }

    /**
     * Function that will create an instance of DrawingTools object with the configurations passed
     *
     * @export
     * @param {string} configs configurations for the DrawingTools in JSON format
     * @returns {*}  {DrawingTools.IDrawingTools} instance of the DrawingTools
     */
    export function CreateDrawingTools(
        drawingToolsId: string,
        configs: string
    ): OSFramework.Maps.DrawingTools.IDrawingTools {
        const map = GetMapByDrawingToolsId(drawingToolsId);
        if (
            OSFramework.Maps.Helper.ValidateFeatureProvider(
                map,
                OSFramework.Maps.Enum.Feature.DrawingTools
            ) === false
        ) {
            return;
        }
        if (!map.drawingTools) {
            const _drawingTools =
                OSFramework.Maps.DrawingTools.DrawingToolsFactory.MakeDrawingTools(
                    map,
                    drawingToolsId,
                    JSON.parse(configs)
                );
            drawingToolsElement = _drawingTools;
            drawingToolsMap.set(drawingToolsId, map.uniqueId);
            map.addDrawingTools(_drawingTools);

            CheckPendingTools(_drawingTools);

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
    ): OSFramework.Maps.DrawingTools.IDrawingTools {
        const drawingTools: OSFramework.Maps.DrawingTools.IDrawingTools =
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
     * Gets the DrawingTools element by the toolId
     *
     * @param {string} toolUniqueId Id of the tool
     */
    export function GetDrawingToolsByToolUniqueId(
        toolUniqueId: string
    ): string {
        //Try to find in DOM only if not present on Map
        const toolElement =
            OSFramework.Maps.Helper.GetElementByUniqueId(toolUniqueId);
        return OSFramework.Maps.Helper.GetClosestDrawingToolsId(toolElement);
    }

    /**
     * Function that will destroy the DrawingTools from the map it belongs to
     * @export
     * @param {string} drawingToolsId id of the DrawingTools that is about to be removed
     */
    export function RemoveDrawingTools(drawingToolsId: string): void {
        const drawingTools = GetDrawingToolsById(drawingToolsId, false);
        if (drawingTools !== undefined) {
            const map = drawingTools.map;

            map && map.removeDrawingTools(drawingToolsId);
            drawingToolsMap.delete(drawingToolsId);
            drawingToolsElement = undefined;
        }
    }

    /**
     * Function that will destroy a specific Tool from the DrawingTools element it belongs to
     *
     * @export
     * @param {string} toolId id of the Tool that is about to be removed
     */
    export function RemoveTool(toolId: string): void {
        const drawingToolsId = GetDrawingToolsByToolUniqueId(toolId);
        const drawingTools = GetDrawingToolsById(drawingToolsId, false);

        drawingTools && drawingTools.removeTool(toolId);
    }
}

/// Overrides for the old namespace - calls the new one, lets users know this is no longer in use

// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace MapAPI.DrawingToolsManager {
    export function AddTool(
        toolId: string,
        type: OSFramework.Maps.Enum.DrawingToolsTypes,
        configs: string
    ): OSFramework.Maps.DrawingTools.ITool {
        OSFramework.Maps.Helper.LogWarningMessage(
            `${OSFramework.Maps.Helper.warningMessage} 'OutSystems.Maps.MapAPI.DrawingToolsManager.AddTool()'`
        );
        return OutSystems.Maps.MapAPI.DrawingToolsManager.AddTool(
            toolId,
            type,
            configs
        );
    }

    export function ChangeProperty(
        drawingToolsId: string,
        propertyName: string,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
        propertyValue: any
    ): void {
        OSFramework.Maps.Helper.LogWarningMessage(
            `${OSFramework.Maps.Helper.warningMessage} 'OutSystems.Maps.MapAPI.DrawingToolsManager.ChangeProperty()'`
        );
        OutSystems.Maps.MapAPI.DrawingToolsManager.ChangeProperty(
            drawingToolsId,
            propertyName,
            propertyValue
        );
    }

    export function ChangeToolProperty(
        toolId: string,
        propertyName: string,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
        propertyValue: any
    ): void {
        OSFramework.Maps.Helper.LogWarningMessage(
            `${OSFramework.Maps.Helper.warningMessage} 'OutSystems.Maps.MapAPI.DrawingToolsManager.ChangeToolProperty()'`
        );
        OutSystems.Maps.MapAPI.DrawingToolsManager.ChangeToolProperty(
            toolId,
            propertyName,
            propertyValue
        );
    }

    export function CheckPendingTools(
        drawingTools: OSFramework.Maps.DrawingTools.IDrawingTools
    ): void {
        OSFramework.Maps.Helper.LogWarningMessage(
            `${OSFramework.Maps.Helper.warningMessage} 'OutSystems.Maps.MapAPI.DrawingToolsManager.CheckPendingTools()'`
        );
        OutSystems.Maps.MapAPI.DrawingToolsManager.CheckPendingTools(
            drawingTools
        );
    }

    export function CreateDrawingTools(
        drawingToolsId: string,
        configs: string
    ): OSFramework.Maps.DrawingTools.IDrawingTools {
        OSFramework.Maps.Helper.LogWarningMessage(
            `${OSFramework.Maps.Helper.warningMessage} 'OutSystems.Maps.MapAPI.DrawingToolsManager.CreateDrawingTools()'`
        );
        return OutSystems.Maps.MapAPI.DrawingToolsManager.CreateDrawingTools(
            drawingToolsId,
            configs
        );
    }

    export function GetDrawingToolsById(
        drawingToolsId: string,
        raiseError = true
    ): OSFramework.Maps.DrawingTools.IDrawingTools {
        OSFramework.Maps.Helper.LogWarningMessage(
            `${OSFramework.Maps.Helper.warningMessage} 'OutSystems.Maps.MapAPI.DrawingToolsManager.GetDrawingToolsById()'`
        );

        return OutSystems.Maps.MapAPI.DrawingToolsManager.GetDrawingToolsById(
            drawingToolsId,
            raiseError
        );
    }

    export function GetDrawingToolsByToolUniqueId(
        toolUniqueId: string
    ): string {
        OSFramework.Maps.Helper.LogWarningMessage(
            `${OSFramework.Maps.Helper.warningMessage} 'OutSystems.Maps.MapAPI.DrawingToolsManager.GetDrawingToolsByToolUniqueId()'`
        );
        return OutSystems.Maps.MapAPI.DrawingToolsManager.GetDrawingToolsByToolUniqueId(
            toolUniqueId
        );
    }

    export function RemoveDrawingTools(drawingToolsId: string): void {
        OSFramework.Maps.Helper.LogWarningMessage(
            `${OSFramework.Maps.Helper.warningMessage} 'OutSystems.Maps.MapAPI.DrawingToolsManager.RemoveDrawingTools()'`
        );
        OutSystems.Maps.MapAPI.DrawingToolsManager.RemoveDrawingTools(
            drawingToolsId
        );
    }

    export function RemoveTool(toolId: string): void {
        OSFramework.Maps.Helper.LogWarningMessage(
            `${OSFramework.Maps.Helper.warningMessage} 'OutSystems.Maps.MapAPI.DrawingToolsManager.RemoveTool()'`
        );
        OutSystems.Maps.MapAPI.DrawingToolsManager.RemoveTool(toolId);
    }
}
