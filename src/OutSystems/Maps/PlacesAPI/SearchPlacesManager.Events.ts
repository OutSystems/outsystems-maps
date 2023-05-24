// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace OutSystems.Maps.PlacesAPI.SearchPlacesManager.Events {
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    const _pendingEvents: Map<
        string,
        {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            cb: any;
            event: OSFramework.Maps.Event.SearchPlaces.SearchPlacesEventType;
            uniqueId: string;
        }[]
    > = new Map<
        string,
        {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            cb: any;
            event: OSFramework.Maps.Event.SearchPlaces.SearchPlacesEventType;
            uniqueId: string;
        }[]
    >();

    const _eventsToSearchPlacesId = new Map<string, string>(); //event.uniqueId -> searchPlaces.uniqueId

    /**
     * API method to check if there are pending events for a specific SearchPlaces
     *
     * @export
     * @param {string} searchPlaces SearchPlaces that is ready for events
     */
    export function CheckPendingEvents(
        searchPlaces: OSFramework.Maps.SearchPlaces.ISearchPlaces
    ): void {
        // For each key of the pendingEvents check if the searchPlaces has the key as a widgetId or uniqueId and add the new handler
        for (const key of _pendingEvents.keys()) {
            if (searchPlaces.equalsToID(key)) {
                _pendingEvents.get(key).forEach((obj) => {
                    searchPlaces.searchPlacesEvents.addHandler(
                        obj.event,
                        obj.cb,
                        obj.uniqueId
                    );
                });
                // Make sure to delete the entry from the pendingEvents
                _pendingEvents.delete(key);
            }
        }
    }

    /**
     * Returns the SearchPlacesId based on the eventUniqueId
     * @param eventUniqueId UniqueId of our Event
     * @param lookUpDOM Search in DOM by the parent SearchPlaces
     */
    export function GetSearchPlacesByEventUniqueId(
        eventUniqueId: string,
        lookUpDOM = true
    ): string {
        //Try to find in DOM only if not present on SearchPlaces
        if (lookUpDOM && !_eventsToSearchPlacesId.has(eventUniqueId)) {
            const eventElement =
                OSFramework.Maps.Helper.GetElementByUniqueId(eventUniqueId);
            const searchPlacesId =
                OSFramework.Maps.Helper.GetClosestSearchPlacesId(eventElement);
            const searchPlaces = GetSearchPlacesById(searchPlacesId);

            if (searchPlaces) {
                _eventsToSearchPlacesId.set(eventUniqueId, searchPlacesId);
            }
        }

        return _eventsToSearchPlacesId.get(eventUniqueId);
    }

    /**
     * API method to subscribe to events of a specific SearchPlaces
     *
     * @export
     * @param {string} searchPlacesId SearchPlaces where the event will be attached
     * @param {OSFramework.Maps.Event.SearchPlaces.SearchPlacesEventType} eventName name fo the event to be attached
     * @param {SearchPlacesAPI.Callbacks.SearchPlaces.Event} callback callback to be invoked when the event occurs
     */
    export function Subscribe(
        searchPlacesId: string,
        eventName: OSFramework.Maps.Event.SearchPlaces.SearchPlacesEventType,
        callback: OSFramework.Maps.Callbacks.SearchPlaces.Event
    ): void {
        // Let's make sure that if the SearchPlaces doesn't exist, we don't throw and exception but instead add the handler to the pendingEvents
        const searchPlaces = GetSearchPlacesById(searchPlacesId, false);
        if (searchPlaces === undefined) {
            if (_pendingEvents.has(searchPlacesId)) {
                _pendingEvents.get(searchPlacesId).push({
                    event: eventName,
                    cb: callback,
                    uniqueId: searchPlacesId
                });
            } else {
                _pendingEvents.set(searchPlacesId, [
                    {
                        event: eventName,
                        cb: callback,
                        uniqueId: searchPlacesId
                    }
                ]);
            }
        } else {
            searchPlaces.searchPlacesEvents.addHandler(
                eventName,
                callback,
                searchPlacesId
            );
        }
    }

    /**
     * API method to unsubscribe an event from a specific SearchPlaces
     *
     * @export
     * @param {string} eventUniqueId Event Id that will get removed
     * @param {OSFramework.Maps.Event.SearchPlaces.SearchPlacesEventType} eventName name of the event to be removed
     * @param {SearchPlacesAPI.Callbacks.SearchPlaces.Event} callback callback that will be removed
     */
    export function Unsubscribe(
        eventUniqueId: string,
        eventName: OSFramework.Maps.Event.SearchPlaces.SearchPlacesEventType,
        callback: OSFramework.Maps.Callbacks.SearchPlaces.Event
    ): void {
        const searchPlacesId = GetSearchPlacesByEventUniqueId(eventUniqueId);
        const searchPlaces = GetSearchPlacesById(searchPlacesId, false);

        if (searchPlaces !== undefined) {
            searchPlaces.searchPlacesEvents.removeHandler(eventName, callback);
        } else {
            if (_pendingEvents.has(searchPlacesId)) {
                const index = _pendingEvents
                    .get(searchPlacesId)
                    .findIndex((element) => {
                        return (
                            element.event === eventName &&
                            element.cb === callback
                        );
                    });
                if (index !== -1) {
                    _pendingEvents.get(searchPlacesId).splice(index, 1);
                }
            }
        }
    }
}

/// Overrides for the old namespace - calls the new one, lets users know this is no longer in use

// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace PlacesAPI.SearchPlacesManager.Events {
    export function CheckPendingEvents(
        searchPlaces: OSFramework.Maps.SearchPlaces.ISearchPlaces
    ): void {
        OSFramework.Maps.Helper.LogWarningMessage(
            `${OSFramework.Maps.Helper.warningMessage} 'OutSystems.Maps.PlacesAPI.SearchPlacesManager.Events.CheckPendingEvents()'`
        );
        OutSystems.Maps.PlacesAPI.SearchPlacesManager.Events.CheckPendingEvents(
            searchPlaces
        );
    }

    export function GetSearchPlacesByEventUniqueId(
        eventUniqueId: string,
        lookUpDOM = true
    ): string {
        OSFramework.Maps.Helper.LogWarningMessage(
            `${OSFramework.Maps.Helper.warningMessage} 'OutSystems.Maps.PlacesAPI.SearchPlacesManager.Events.GetSearchPlacesByEventUniqueId()'`
        );
        return OutSystems.Maps.PlacesAPI.SearchPlacesManager.Events.GetSearchPlacesByEventUniqueId(
            eventUniqueId,
            lookUpDOM
        );
    }

    export function Subscribe(
        searchPlacesId: string,
        eventName: OSFramework.Maps.Event.SearchPlaces.SearchPlacesEventType,
        callback: OSFramework.Maps.Callbacks.SearchPlaces.Event
    ): void {
        OSFramework.Maps.Helper.LogWarningMessage(
            `${OSFramework.Maps.Helper.warningMessage} 'OutSystems.Maps.PlacesAPI.SearchPlacesManager.Events.Subscribe()'`
        );
        OutSystems.Maps.PlacesAPI.SearchPlacesManager.Events.Subscribe(
            searchPlacesId,
            eventName,
            callback
        );
    }

    export function Unsubscribe(
        eventUniqueId: string,
        eventName: OSFramework.Maps.Event.SearchPlaces.SearchPlacesEventType,
        callback: OSFramework.Maps.Callbacks.SearchPlaces.Event
    ): void {
        OSFramework.Maps.Helper.LogWarningMessage(
            `${OSFramework.Maps.Helper.warningMessage} 'OutSystems.Maps.PlacesAPI.SearchPlacesManager.Events.Unsubscribe()'`
        );
        OutSystems.Maps.PlacesAPI.SearchPlacesManager.Events.Unsubscribe(
            eventUniqueId,
            eventName,
            callback
        );
    }
}
