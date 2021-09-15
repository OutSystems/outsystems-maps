// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace MapAPI.DrawingToolsManager.Events {
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
    const _pendingEvents: Map<
        string,
        {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            cb: any;
            event: OSFramework.Event.DrawingTools.DrawingToolsEventType;
        }[]
    > = new Map<
        string,
        {
            // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
            cb: any;
            event: OSFramework.Event.DrawingTools.DrawingToolsEventType;
        }[]
    >();

    /**
     * API method to check if there are pending events for a specific DrawingTools
     *
     * @export
     * @param {string} drawingTools DrawingTools that is ready for events
     */
    export function CheckPendingEvents(
        drawingTools: OSFramework.DrawingTools.IDrawingTools
    ): void {
        // For each key of the pendingEvents check if the shape has the key as a widgetId or uniqueId and add the new handler
        for (const key of _pendingEvents.keys()) {
            if (drawingTools.equalsToID(key)) {
                _pendingEvents.get(key).forEach((obj) => {
                    drawingTools.drawingToolsEvents.addHandler(
                        obj.event,
                        obj.cb
                    );
                });
                drawingTools.refreshProviderEvents();
                // Make sure to delete the entry from the pendingEvents
                _pendingEvents.delete(key);
            }
        }
    }

    // /**
    //  * API method to subscribe to events of a specific Tool from the DrawingTools
    //  *
    //  * @export
    //  * @param {string} toolUniqueId Id of the tool
    //  * @param {OSFramework.Event.Map.MapEventType} eventName name fo the event to be attached
    //  * @param {MapAPI.Callbacks.OSMap.Event} callback callback to be invoked when the event occurs
    //  */
    // export function SubscribeByToolUniqueId(
    //     toolUniqueId: string,
    //     eventName: OSFramework.Event.DrawingTools.DrawingToolsEventType,
    //     // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
    //     callback: OSFramework.Callbacks.DrawingTools.Event
    // ): void {
    //     // Let's make sure that if the Map doesn't exist, we don't throw and exception but instead add the handler to the pendingEvents
    //     const drawingToolsId = GetDrawingToolsByToolUniqueId(toolUniqueId);
    //     const drawingTools = GetDrawingToolsById(drawingToolsId, false);

    //     if (drawingTools === undefined) {
    //         if (_pendingEvents.has(drawingToolsId)) {
    //             _pendingEvents.get(drawingToolsId).push({
    //                 event: eventName,
    //                 cb: callback
    //             });
    //         } else {
    //             _pendingEvents.set(drawingToolsId, [
    //                 {
    //                     event: eventName,
    //                     cb: callback
    //                 }
    //             ]);
    //         }
    //     } else {
    //         drawingTools.drawingToolsEvents.addHandler(eventName, callback);
    //     }
    // }

    // /**
    //  * API method to unsubscribe events from a specific Tool of the DrawingTools
    //  *
    //  * @export
    //  * @param {string} toolUniqueId Id of the tool
    //  * @param {OSFramework.Event.Map.MapEventType} eventName name fo the event to be attached
    //  * @param {MapAPI.Callbacks.OSMap.Event} callback callback to be invoked when the event occurs
    //  */
    // export function UnsubscribeByToolId(
    //     toolUniqueId: string,
    //     eventName: OSFramework.Event.DrawingTools.DrawingToolsEventType,
    //     // eslint-disable-next-line
    //     callback: OSFramework.Callbacks.DrawingTools.Event
    // ): void {
    //     const drawingToolsId = GetDrawingToolsByToolUniqueId(toolUniqueId);
    //     const drawingTools = GetDrawingToolsById(drawingToolsId, false);
    //     if (drawingTools !== undefined) {
    //         drawingTools.drawingToolsEvents.removeHandler(eventName, callback);
    //         // Let's make sure the events get refreshed on the drawingTools provider
    //         drawingTools.refreshProviderEvents();
    //     } else {
    //         if (_pendingEvents.has(drawingToolsId)) {
    //             const index = _pendingEvents
    //                 .get(drawingToolsId)
    //                 .findIndex((element) => {
    //                     return (
    //                         element.event === eventName &&
    //                         element.cb === callback
    //                     );
    //                 });
    //             if (index !== -1) {
    //                 _pendingEvents.get(drawingToolsId).splice(index, 1);
    //             }
    //         }
    //     }
    // }
}
