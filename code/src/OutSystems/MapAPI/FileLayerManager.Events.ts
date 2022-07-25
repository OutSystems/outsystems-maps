// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace OutSystems.Maps.MapAPI.FileLayerManager.Events {
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
    const _pendingEvents: Map<
        string,
        {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            cb: any;
            event: OSFramework.Event.FileLayer.FileLayersEventType;
        }[]
    > = new Map<
        string,
        {
            // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
            cb: any;
            event: OSFramework.Event.FileLayer.FileLayersEventType;
        }[]
    >();

    /**
     * API method to check if there are pending events for a specific FileLayer
     *
     * @export
     * @param {string} fileLayer FileLayer that is ready for events
     */
    export function CheckPendingEvents(
        fileLayer: OSFramework.FileLayer.IFileLayer
    ): void {
        // For each key of the pendingEvents check if the shape has the key as a widgetId or uniqueId and add the new handler
        for (const key of _pendingEvents.keys()) {
            if (fileLayer.equalsToID(key)) {
                _pendingEvents.get(key).forEach((obj) => {
                    fileLayer.fileLayerEvents.addHandler(obj.event, obj.cb);
                });
                fileLayer.refreshProviderEvents();
                // Make sure to delete the entry from the pendingEvents
                _pendingEvents.delete(key);
            }
        }
    }

    /**
     * API method to subscribe to events of a specific FileLayer
     * This method is being deprecated. It will get removed soon.
     *
     * @export
     * @param {string} fileLayerId FileLayer where the events will get attached
     * @param {OSFramework.Event.FileLayer.FileLayerEventType} eventName name of the event to get attached
     * @param {OSFramework.Callbacks.FileLayer.ClickEvent} callback to be invoked when the event occurs
     */
    export function Subscribe(
        fileLayerId: string,
        eventName: OSFramework.Event.FileLayer.FileLayersEventType,
        callback: OSFramework.Callbacks.FileLayer.Event
    ): void {
        const fileLayer = GetFileLayerById(fileLayerId, false);
        if (fileLayer === undefined) {
            if (_pendingEvents.has(fileLayerId)) {
                _pendingEvents.get(fileLayerId).push({
                    event: eventName,
                    cb: callback
                });
            } else {
                _pendingEvents.set(fileLayerId, [
                    {
                        event: eventName,
                        cb: callback
                    }
                ]);
            }
        } else {
            fileLayer.fileLayerEvents.addHandler(eventName, callback);
            fileLayer.refreshProviderEvents();
        }
    }

    /**
     * API method to unsubscribe an event from a specific FileLayer
     *
     * @export
     * @param {string} eventUniqueId Event Id that will get removed
     * @param {OSFramework.Event.Map.MapEventType} eventName name of the event to be removed
     * @param {MapAPI.Callbacks.OSMap.Event} callback callback that will be removed
     */
    export function Unsubscribe(
        fileLayerId: string,
        eventName: OSFramework.Event.FileLayer.FileLayersEventType,
        callback: OSFramework.Callbacks.FileLayer.Event
    ): void {
        const fileLayer = GetFileLayerById(fileLayerId, false);

        if (fileLayer !== undefined) {
            fileLayer.fileLayerEvents.removeHandler(eventName, callback);
            // Let's make sure the events get refreshed on the fileLayer provider
            fileLayer.refreshProviderEvents();
        } else {
            if (_pendingEvents.has(fileLayerId)) {
                const index = _pendingEvents
                    .get(fileLayerId)
                    .findIndex((element) => {
                        return (
                            element.event === eventName &&
                            element.cb === callback
                        );
                    });
                if (index !== -1) {
                    _pendingEvents.get(fileLayerId).splice(index, 1);
                }
            }
        }
    }
}

/// Overrides for the old namespace - calls the new one, lets users know this is no longer in use

// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace MapAPI.FileLayerManager.Events {
    export function CheckPendingEvents(
        fileLayer: OSFramework.FileLayer.IFileLayer
    ): void {
        OSFramework.Helper.LogWarningMessage(
            `${OSFramework.Helper.warningMessage} 'OutSystems.Maps.MapAPI.FileLayerManager.Events.CheckPendingEvents()'`
        );
        OutSystems.Maps.MapAPI.FileLayerManager.Events.CheckPendingEvents(
            fileLayer
        );
    }

    export function Subscribe(
        fileLayerId: string,
        eventName: OSFramework.Event.FileLayer.FileLayersEventType,
        callback: OSFramework.Callbacks.FileLayer.Event
    ): void {
        OSFramework.Helper.LogWarningMessage(
            `${OSFramework.Helper.warningMessage} 'OutSystems.Maps.MapAPI.FileLayerManager.Events.Subscribe()'`
        );
        OutSystems.Maps.MapAPI.FileLayerManager.Events.Subscribe(
            fileLayerId,
            eventName,
            callback
        );
    }

    export function Unsubscribe(
        fileLayerId: string,
        eventName: OSFramework.Event.FileLayer.FileLayersEventType,
        callback: OSFramework.Callbacks.FileLayer.Event
    ): void {
        OSFramework.Helper.LogWarningMessage(
            `${OSFramework.Helper.warningMessage} 'OutSystems.Maps.MapAPI.FileLayerManager.Events.Unsubscribe()'`
        );
        OutSystems.Maps.MapAPI.FileLayerManager.Events.Unsubscribe(
            fileLayerId,
            eventName,
            callback
        );
    }
}
