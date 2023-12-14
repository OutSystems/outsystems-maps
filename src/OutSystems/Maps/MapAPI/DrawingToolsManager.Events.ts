// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace OutSystems.Maps.MapAPI.DrawingToolsManager.Events {
    const _pendingEvents: Map<
        string,
        {
            cb: OSFramework.Maps.Callbacks.Generic;
            event: OSFramework.Maps.Event.DrawingTools.DrawingToolsEventType;
            uniqueId: string; //Event unique identifier
        }[]
    > = new Map<
        string,
        {
            cb: OSFramework.Maps.Callbacks.Generic;
            event: OSFramework.Maps.Event.DrawingTools.DrawingToolsEventType;
            uniqueId: string; //Event unique identifier
        }[]
    >();

    /**
     * API method to check if there are pending events for a specific DrawingTools
     *
     * @export
     * @param {string} drawingTools DrawingTools that is ready for events
     */
    export function CheckPendingEvents(
        drawingTools: OSFramework.Maps.DrawingTools.IDrawingTools
    ): void {
        // For each key of the pendingEvents check if the shape has the key as a widgetId or uniqueId and add the new handler
        for (const key of _pendingEvents.keys()) {
            if (drawingTools.equalsToID(key)) {
                _pendingEvents.get(key).forEach((obj) => {
                    drawingTools.drawingToolsEvents.addHandler(
                        obj.event,
                        obj.cb,
                        obj.uniqueId
                    );
                });
                drawingTools.refreshProviderEvents();
                // Make sure to delete the entry from the pendingEvents
                _pendingEvents.delete(key);
            }
        }
    }

    /**
     * API method to subscribe to events of a specific Tool from the DrawingTools
     *
     * @export
     * @param {string} toolUniqueId Id of the tool
     * @param {OSFramework.Maps.Event.Map.MapEventType} eventName name fo the event to be attached
     * @param {MapAPI.Callbacks.OSMap.Event} callback callback to be invoked when the event occurs
     */
    export function SubscribeByToolUniqueId(
        toolUniqueId: string,
        eventName: OSFramework.Maps.Event.DrawingTools.DrawingToolsEventType,
        callback: OSFramework.Maps.Callbacks.DrawingTools.Event
    ): void {
        // Let's make sure that if the Map doesn't exist, we don't throw and exception but instead add the handler to the pendingEvents
        const drawingToolsId = GetDrawingToolsByToolUniqueId(toolUniqueId);
        const drawingTools = GetDrawingToolsById(drawingToolsId, false);

        if (drawingTools === undefined) {
            if (_pendingEvents.has(drawingToolsId)) {
                _pendingEvents.get(drawingToolsId).push({
                    event: eventName,
                    cb: callback,
                    uniqueId: toolUniqueId
                });
            } else {
                _pendingEvents.set(drawingToolsId, [
                    {
                        event: eventName,
                        cb: callback,
                        uniqueId: toolUniqueId
                    }
                ]);
            }
        } else {
            drawingTools.drawingToolsEvents.addHandler(
                eventName,
                callback,
                toolUniqueId
            );
        }
    }

    /**
     * API method to unsubscribe events from a specific Tool of the DrawingTools
     *
     * @export
     * @param {string} toolUniqueId Id of the tool
     * @param {OSFramework.Maps.Event.Map.MapEventType} eventName name fo the event to be attached
     * @param {MapAPI.Callbacks.OSMap.Event} callback callback to be invoked when the event occurs
     */
    export function UnsubscribeByToolId(
        toolUniqueId: string,
        eventName: OSFramework.Maps.Event.DrawingTools.DrawingToolsEventType,
        callback: OSFramework.Maps.Callbacks.DrawingTools.Event
    ): void {
        const drawingToolsId = GetDrawingToolsByToolUniqueId(toolUniqueId);
        const drawingTools = GetDrawingToolsById(drawingToolsId, false);
        if (drawingTools !== undefined) {
            drawingTools.drawingToolsEvents.removeHandler(eventName, callback);
            // Let's make sure the events get refreshed on the drawingTools provider
            drawingTools.refreshProviderEvents();
        } else {
            if (_pendingEvents.has(drawingToolsId)) {
                const index = _pendingEvents
                    .get(drawingToolsId)
                    .findIndex((element) => {
                        return (
                            element.event === eventName &&
                            element.cb === callback
                        );
                    });
                if (index !== -1) {
                    _pendingEvents.get(drawingToolsId).splice(index, 1);
                }
            }
        }
    }
}

/// Overrides for the old namespace - calls the new one, lets users know this is no longer in use

// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace MapAPI.DrawingToolsManager.Events {
    export function CheckPendingEvents(
        drawingTools: OSFramework.Maps.DrawingTools.IDrawingTools
    ): void {
        OSFramework.Maps.Helper.LogWarningMessage(
            `${OSFramework.Maps.Helper.warningMessage} 'OutSystems.Maps.MapAPI.DrawingToolsManager.Events.CheckPendingEvents()'`
        );
        OutSystems.Maps.MapAPI.DrawingToolsManager.Events.CheckPendingEvents(
            drawingTools
        );
    }

    export function SubscribeByToolUniqueId(
        toolUniqueId: string,
        eventName: OSFramework.Maps.Event.DrawingTools.DrawingToolsEventType,
        callback: OSFramework.Maps.Callbacks.DrawingTools.Event
    ): void {
        OSFramework.Maps.Helper.LogWarningMessage(
            `${OSFramework.Maps.Helper.warningMessage} 'OutSystems.Maps.MapAPI.DrawingToolsManager.Events.SubscribeByToolUniqueId()'`
        );
        OutSystems.Maps.MapAPI.DrawingToolsManager.Events.SubscribeByToolUniqueId(
            toolUniqueId,
            eventName,
            callback
        );
    }

    export function UnsubscribeByToolId(
        toolUniqueId: string,
        eventName: OSFramework.Maps.Event.DrawingTools.DrawingToolsEventType,
        callback: OSFramework.Maps.Callbacks.DrawingTools.Event
    ): void {
        OSFramework.Maps.Helper.LogWarningMessage(
            `${OSFramework.Maps.Helper.warningMessage} 'OutSystems.Maps.MapAPI.DrawingToolsManager.Events.UnsubscribeByToolId()'`
        );
        OutSystems.Maps.MapAPI.DrawingToolsManager.Events.UnsubscribeByToolId(
            toolUniqueId,
            eventName,
            callback
        );
    }
}
