// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace OutSystems.Maps.MapAPI.MapManager {
    const maps = new Map<string, OSFramework.Maps.OSMap.IMap>(); //map.uniqueId -> Map obj
    let activeMap: OSFramework.Maps.OSMap.IMap = undefined;

    /**
     * Function that will change the property value of a given Map.
     *
     * @export
     * @param {string} mapId Id of the Map where the change will occur.
     * @param {string} propertyName name of the property to be changed - some properties of the provider might not work out of be box.
     * @param {*} propertyValue value to which the property should be changed to.
     */
    export function ChangeProperty(
        mapId: string,
        propertyName: string,
        propertyValue: unknown
    ): void {
        const map = GetMapById(mapId);

        map.changeProperty(propertyName, propertyValue);
    }

    /**
     * Function that will create an instance of Map object with the configurations passed.
     *
     * @export
     * @param {string} mapId Id of the Map that is going to be created.
     * @param {string} providerType Type of the Provider (e.g. GoogleProvider, etc)
     * @param {string} configs configurations for the Map in JSON format.
     * @returns {*}  {OSMap.IMap} instance of the Map.
     */
    export function CreateMap(
        mapId: string,
        provider: OSFramework.Maps.Enum.ProviderType,
        providerType: OSFramework.Maps.Enum.MapType,
        configs: string
    ): OSFramework.Maps.OSMap.IMap {
        const _map = OSFramework.Maps.OSMap.MapFactory.MakeMap(
            provider,
            providerType,
            mapId,
            JSON.parse(configs)
        );

        if (maps.has(mapId)) {
            throw new Error(
                `There is already a Map registered under id:${mapId}`
            );
        }

        maps.set(mapId, _map);
        activeMap = _map;

        Events.CheckPendingEvents(_map);

        return _map;
    }

    /**
     * Function that will get the instance of the current active Map. The active Map, is always the last (existing) Map that was created in the page.
     *
     * @export
     * @returns {*}  {OSMap.IMap} instance of the active Map.
     */
    export function GetActiveMap(): OSFramework.Maps.OSMap.IMap {
        return activeMap;
    }

    /**
     * Function that will retrieve all Markers from the Map.
     *
     * @export
     * @param {string} mapId Id of the Map to get the Markers.
     */
    export function GetAllMarkers(
        mapId: string
    ): Array<OSFramework.Maps.Marker.IMarker> {
        const map = GetMapById(mapId);

        return map.markers;
    }

    /**
     * Function that will get the instance of a Map, by a given Id.
     *
     * @export
     * @param {string} mapId Id of the Map where the change will occur.
     * @param {boolean} raiseError Will raise errors when there is no object with this uniqueId
     * @returns {*}  {OSMap.IMap} instance of the Map.
     */
    export function GetMapById(
        mapId: string,
        raiseError = true
    ): OSFramework.Maps.OSMap.IMap {
        let map: OSFramework.Maps.OSMap.IMap;

        //mapId is the UniqueId
        if (maps.has(mapId)) {
            map = maps.get(mapId);
        } else {
            //Search for WidgetId
            for (const p of maps.values()) {
                if (p.equalsToID(mapId)) {
                    map = p;
                    break;
                }
            }
        }

        if (map === undefined && raiseError) {
            throw new Error(`Map id:${mapId} not found`);
        }

        return map;
    }
    /**
     * Function that will return the center coordinates of a given map.
     *
     * @export
     * @param {string} mapId Id of the Map where the change will occur.
     * @returns {*}  {OSMap.IMap} instance of the Map.
     */
    export function GetMapCenter(mapId: string): string {
        const map = MapManager.GetMapById(mapId, true);
        const getMapCenterResponse = map.features.center.getMapCenter();
        return JSON.stringify(getMapCenterResponse);
    }
    /**
     * Function that will get all the maps from the current page
     * @returns Map structure containing all the maps and the corresponding uniqueId
     */
    export function GetMapsFromPage(): Map<
        string,
        OSFramework.Maps.OSMap.IMap
    > {
        return maps;
    }

    /**
     * Function that will initialize the provider Map in the page.
     * The current provider Map is GoogleMaps.
     * @export
     * @param {string} mapId Id of the Map that is going to be initialized.
     */
    export function InitializeMap(mapId: string): void {
        const map = GetMapById(mapId);

        map.build();
        Events.CheckPendingEvents(map);
    }

    /**
     * Function that will destroy the Map from the page.
     *
     * @export
     * @param {string} mapId Id of the Map to be destroyed.
     */
    export function RemoveMap(mapId: string): void {
        const map = GetMapById(mapId);

        maps.delete(map.uniqueId);

        //Update activeMap with the most recent one
        if (activeMap.uniqueId === map.uniqueId) {
            activeMap = Array.from(maps.values()).pop();
        }

        map.dispose();
    }

    /**
     * Function that will remove all Markers from a given Map.
     *
     * @export
     * @param {string} mapId Id of the Map to have markers removed.
     */
    export function RemoveMarkers(mapId: string): void {
        const map = GetMapById(mapId);

        map.removeAllMarkers();
    }

    /**
     * Function that will remove all File Layers from a given Map.
     *
     * @export
     * @param {string} mapId Id of the Map to have markers removed.
     */
    export function RemoveFileLayers(mapId: string): void {
        const map = GetMapById(mapId);

        map.removeAllFileLayers();
    }

    /**
     * Function that will set the height of a given Map.
     *
     * @export
     * @param {string} mapId Id of the Map where the change will occur.
     * @param {string} height new height for the map.
     */
    export function SetHeight(mapId: string, height: string): void {
        const map = GetMapById(mapId);
        let widgetId = map.widgetId;

        //This code below, should be removed... we'd be better of without it.
        //It would imply that the widgetId would be set in a different moment than what is now.
        //*************************************/
        if (widgetId === undefined) {
            widgetId = OSFramework.Maps.Helper.GetElementByUniqueId(
                mapId
            ).closest(map.mapTag).id;
        }
        //*************************************/

        const widget = OSFramework.Maps.Helper.GetElementByWidgetId(widgetId);

        if (widget) {
            if (height === '') {
                let parentHeight = 0;
                let currParent = widget.parentNode as HTMLElement;
                // Get the parent height
                // If the parent height is <= 200, keep trying until we reach the <body> tag.
                // (don't use the parent height <= 200 because the DOM has some other elements from the template with smaller heights)
                do {
                    parentHeight = currParent.offsetHeight;
                    currParent = currParent.parentNode as HTMLElement;
                } while (parentHeight <= 200 && currParent !== document.body);
                height = parentHeight + 'px';
            } else {
                if (isNaN(Number(height)) === false) {
                    height = height + 'px';
                }
            }

            widget.style.setProperty('--map-height', height);
            // Updates the Height of the Map by refreshing/updating the provider
            map.updateHeight();
        } else {
            throw new Error(`Map id:${mapId} not found`);
        }
    }

    /**
     * Sets the Renderer object to create the clusters. If undefined if passed the default render will be used.
     * Available for Google Maps only. See examples in https://googlemaps.github.io/js-markerclusterer/public/renderers/.
     *
     * @export
     * @param {string} mapId
     * @param {OSFramework.Maps.Feature.IMarkerClusterer} renderer
     */
    export function SetClusterRenderer(mapId: string, renderer: OSFramework.Maps.Feature.IMarkerClustererRender) {
        const map = GetMapById(mapId);

        if (map.providerType === OSFramework.Maps.Enum.ProviderType.Google) {
            map.setClusterRenderer(renderer);
        } else {
            throw new Error(
                `Map id:${mapId} is not an instance of Google Map. This API is only available to for Google Maps.`
            );
        }
    }
}

/// Overrides for the old namespace - calls the new one, lets users know this is no longer in use

// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace MapAPI.MapManager {
    export function ChangeProperty(
        mapId: string,
        propertyName: string,
        propertyValue: unknown
    ): void {
        OSFramework.Maps.Helper.LogWarningMessage(
            `${OSFramework.Maps.Helper.warningMessage} 'OutSystems.Maps.MapAPI.MapManager.ChangeProperty()'`
        );
        OutSystems.Maps.MapAPI.MapManager.ChangeProperty(
            mapId,
            propertyName,
            propertyValue
        );
    }

    export function CreateMap(
        mapId: string,
        provider: OSFramework.Maps.Enum.ProviderType,
        providerType: OSFramework.Maps.Enum.MapType,
        configs: string
    ): OSFramework.Maps.OSMap.IMap {
        OSFramework.Maps.Helper.LogWarningMessage(
            `${OSFramework.Maps.Helper.warningMessage} 'OutSystems.Maps.MapAPI.MapManager.CreateMap()'`
        );
        return OutSystems.Maps.MapAPI.MapManager.CreateMap(
            mapId,
            provider,
            providerType,
            configs
        );
    }

    export function GetActiveMap(): OSFramework.Maps.OSMap.IMap {
        OSFramework.Maps.Helper.LogWarningMessage(
            `${OSFramework.Maps.Helper.warningMessage} 'OutSystems.Maps.MapAPI.MapManager.GetActiveMap()'`
        );
        return OutSystems.Maps.MapAPI.MapManager.GetActiveMap();
    }

    export function GetAllMarkers(
        mapId: string
    ): Array<OSFramework.Maps.Marker.IMarker> {
        OSFramework.Maps.Helper.LogWarningMessage(
            `${OSFramework.Maps.Helper.warningMessage} 'OutSystems.Maps.MapAPI.MapManager.GetAllMarkers()'`
        );
        return OutSystems.Maps.MapAPI.MapManager.GetAllMarkers(mapId);
    }

    export function GetMapById(
        mapId: string,
        raiseError = true
    ): OSFramework.Maps.OSMap.IMap {
        OSFramework.Maps.Helper.LogWarningMessage(
            `${OSFramework.Maps.Helper.warningMessage} 'OutSystems.Maps.MapAPI.MapManager.GetMapById()'`
        );
        return OutSystems.Maps.MapAPI.MapManager.GetMapById(mapId, raiseError);
    }

    export function GetMapsFromPage(): Map<
        string,
        OSFramework.Maps.OSMap.IMap
    > {
        OSFramework.Maps.Helper.LogWarningMessage(
            `${OSFramework.Maps.Helper.warningMessage} 'OutSystems.Maps.MapAPI.MapManager.GetMapsFromPage()'`
        );
        return OutSystems.Maps.MapAPI.MapManager.GetMapsFromPage();
    }

    export function InitializeMap(mapId: string): void {
        OSFramework.Maps.Helper.LogWarningMessage(
            `${OSFramework.Maps.Helper.warningMessage} 'OutSystems.Maps.MapAPI.MapManager.InitializeMap()'`
        );
        OutSystems.Maps.MapAPI.MapManager.InitializeMap(mapId);
    }

    export function RemoveMap(mapId: string): void {
        OSFramework.Maps.Helper.LogWarningMessage(
            `${OSFramework.Maps.Helper.warningMessage} 'OutSystems.Maps.MapAPI.MapManager.RemoveMap()'`
        );
        OutSystems.Maps.MapAPI.MapManager.RemoveMap(mapId);
    }

    export function RemoveMarkers(mapId: string): void {
        OSFramework.Maps.Helper.LogWarningMessage(
            `${OSFramework.Maps.Helper.warningMessage} 'OutSystems.Maps.MapAPI.MapManager.RemoveMarkers()'`
        );
        OutSystems.Maps.MapAPI.MapManager.RemoveMarkers(mapId);
    }

    export function RemoveFileLayers(mapId: string): void {
        OSFramework.Maps.Helper.LogWarningMessage(
            `${OSFramework.Maps.Helper.warningMessage} 'OutSystems.Maps.MapAPI.MapManager.RemoveFileLayers()'`
        );
        OutSystems.Maps.MapAPI.MapManager.RemoveFileLayers(mapId);
    }

    export function SetHeight(mapId: string, height: string): void {
        OSFramework.Maps.Helper.LogWarningMessage(
            `${OSFramework.Maps.Helper.warningMessage} 'OutSystems.Maps.MapAPI.MapManager.SetHeight()'`
        );
        OutSystems.Maps.MapAPI.MapManager.SetHeight(mapId, height);
    }
}
