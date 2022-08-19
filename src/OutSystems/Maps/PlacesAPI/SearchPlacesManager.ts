// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace OutSystems.Maps.PlacesAPI.SearchPlacesManager {
    const searchPlacesMap = new Map<
        string,
        OSFramework.Maps.SearchPlaces.ISearchPlaces
    >(); //searchPlaces.uniqueId -> SearchPlaces obj
    let activeSearchPlaces: OSFramework.Maps.SearchPlaces.ISearchPlaces = undefined;

    /**
     * Function that will change the property value of a given SearchPlaces.
     *
     * @export
     * @param {string} searchPlacesId Id of the SearchPlaces where the change will occur.
     * @param {string} propertyName name of the property to be changed - some properties of the provider might not work out of be box.
     * @param {*} propertyValue value to which the property should be changed to.
     */
    export function ChangeProperty(
        searchPlacesId: string,
        propertyName: string,
        // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
        propertyValue: any
    ): void {
        const searchPlaces = GetSearchPlacesById(searchPlacesId);

        searchPlaces.changeProperty(propertyName, propertyValue);
    }

    /**
     * Function that will create an instance of SearchPlaces object with the configurations passed.
     *
     * @export
     * @param {string} searchPlacesId Id of the SearchPlaces that is going to be created.
     * @param {string} providerType Type of the Provider (e.g. GoogleProvider, etc)
     * @param {string} configs configurations for the SearchPlaces in JSON format.
     * @returns {*}  {SearchPlaces.ISearchPlaces} instance of the SearchPlaces.
     */
    export function CreateSearchPlaces(
        searchPlacesId: string,
        configs: string
    ): OSFramework.Maps.SearchPlaces.ISearchPlaces {
        const _searchPlaces =
            Provider.Google.SearchPlaces.SearchPlacesFactory.MakeSearchPlaces(
                searchPlacesId,
                JSON.parse(configs)
            );

        if (searchPlacesMap.has(searchPlacesId)) {
            throw new Error(
                `There is already a SearchPlaces registered under id:${searchPlacesId}`
            );
        }

        searchPlacesMap.set(searchPlacesId, _searchPlaces);
        activeSearchPlaces = _searchPlaces;

        Events.CheckPendingEvents(_searchPlaces);

        return _searchPlaces;
    }

    /**
     * Function that will get the instance of the current active SearchPlaces. The active SearchPlaces, is always the last (existing) SearchPlaces that was created in the page.
     *
     * @export
     * @returns {*}  {SearchPlaces.ISearchPlaces} instance of the active SearchPlaces.
     */
    export function GetActiveSearchPlaces(): OSFramework.Maps.SearchPlaces.ISearchPlaces {
        return activeSearchPlaces;
    }

    /**
     * Function that will get the instance of a SearchPlaces, by a given Id.
     *
     * @export
     * @param {string} searchPlacesId Id of the SearchPlaces where the change will occur.
     * @param {boolean} raiseError Will raise errors when there is no object with this uniqueId
     * @returns {*}  {SearchPlaces.ISearchPlaces} instance of the SearchPlaces.
     */
    export function GetSearchPlacesById(
        searchPlacesId: string,
        raiseError = true
    ): OSFramework.Maps.SearchPlaces.ISearchPlaces {
        let _searchPlaces: OSFramework.Maps.SearchPlaces.ISearchPlaces;

        //searchPlacesId is the UniqueId
        if (searchPlacesMap.has(searchPlacesId)) {
            _searchPlaces = searchPlacesMap.get(searchPlacesId);
        } else {
            //Search for WidgetId
            for (const p of searchPlacesMap.values()) {
                if (p.equalsToID(searchPlacesId)) {
                    _searchPlaces = p;
                    break;
                }
            }
        }

        if (_searchPlaces === undefined && raiseError) {
            throw new Error(`SearchPlaces id:${searchPlacesId} not found`);
        }

        return _searchPlaces;
    }

    /**
     * Function that will get all the searchPlacess from the current page
     * @returns SearchPlaces structure containing all the searchPlacess and the corresponding uniqueId
     */
    export function GetSearchPlacessFromPage(): Map<
        string,
        OSFramework.Maps.SearchPlaces.ISearchPlaces
    > {
        return searchPlacesMap;
    }

    /**
     * Function that will initialize the provider SearchPlaces in the page.
     * The current provider SearchPlaces is GoogleSearchPlacess.
     * @export
     * @param {string} searchPlacesId Id of the SearchPlaces that is going to be initialized.
     */
    export function InitializeSearchPlaces(searchPlacesId: string): void {
        const searchPlaces = GetSearchPlacesById(searchPlacesId);
        searchPlaces.build();
        Events.CheckPendingEvents(searchPlaces);
    }

    /**
     * Function that will destroy the SearchPlaces from the page.
     *
     * @export
     * @param {string} searchPlacesId Id of the SearchPlaces to be destroyed.
     */
    export function RemoveSearchPlaces(searchPlacesId: string): void {
        const _searchPlaces = GetSearchPlacesById(searchPlacesId);

        searchPlacesMap.delete(_searchPlaces.uniqueId);

        //Update activeSearchPlaces with the most recent one
        if (activeSearchPlaces.uniqueId === _searchPlaces.uniqueId) {
            activeSearchPlaces = Array.from(searchPlacesMap.values()).pop();
        }

        _searchPlaces.dispose();
    }
}

/// Overrides for the old namespace - calls the new one, lets users know this is no longer in use
// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace PlacesAPI.SearchPlacesManager {
    export function ChangeProperty(
        searchPlacesId: string,
        propertyName: string,
        // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
        propertyValue: any
    ): void {
        OSFramework.Maps.Helper.LogWarningMessage(
            `${OSFramework.Maps.Helper.warningMessage} 'OutSystems.Maps.PlacesAPI.SearchPlacesManager.ChangeProperty()'`
        );
        OutSystems.Maps.PlacesAPI.SearchPlacesManager.ChangeProperty(
            searchPlacesId,
            propertyName,
            propertyValue
        );
    }

    export function CreateSearchPlaces(
        searchPlacesId: string,
        configs: string
    ): OSFramework.Maps.SearchPlaces.ISearchPlaces {
        OSFramework.Maps.Helper.LogWarningMessage(
            `${OSFramework.Maps.Helper.warningMessage}  'OutSystems.Maps.PlacesAPI.SearchPlacesManager.CreateSearchPlaces()'`
        );
        return OutSystems.Maps.PlacesAPI.SearchPlacesManager.CreateSearchPlaces(
            searchPlacesId,
            configs
        );
    }

    export function GetActiveSearchPlaces(): OSFramework.Maps.SearchPlaces.ISearchPlaces {
        OSFramework.Maps.Helper.LogWarningMessage(
            `${OSFramework.Maps.Helper.warningMessage} 'OutSystems.Maps.PlacesAPI.SearchPlacesManager.GetActiveSearchPlaces()'`
        );
        return OutSystems.Maps.PlacesAPI.SearchPlacesManager.GetActiveSearchPlaces();
    }

    export function GetSearchPlacesById(
        searchPlacesId: string,
        raiseError = true
    ): OSFramework.Maps.SearchPlaces.ISearchPlaces {
        OSFramework.Maps.Helper.LogWarningMessage(
            `${OSFramework.Maps.Helper.warningMessage} 'OutSystems.Maps.PlacesAPI.SearchPlacesManager.GetSearchPlacesById()'`
        );
        return OutSystems.Maps.PlacesAPI.SearchPlacesManager.GetSearchPlacesById(
            searchPlacesId,
            raiseError
        );
    }

    export function GetSearchPlacessFromPage(): Map<
        string,
        OSFramework.Maps.SearchPlaces.ISearchPlaces
    > {
        OSFramework.Maps.Helper.LogWarningMessage(
            `${OSFramework.Maps.Helper.warningMessage} 'OutSystems.Maps.PlacesAPI.SearchPlacesManager.GetSearchPlacessFromPage()'`
        );
        return OutSystems.Maps.PlacesAPI.SearchPlacesManager.GetSearchPlacessFromPage();
    }

    export function InitializeSearchPlaces(searchPlacesId: string): void {
        OSFramework.Maps.Helper.LogWarningMessage(
            `${OSFramework.Maps.Helper.warningMessage} 'OutSystems.Maps.PlacesAPI.SearchPlacesManager.InitializeSearchPlaces()'`
        );
        OutSystems.Maps.PlacesAPI.SearchPlacesManager.InitializeSearchPlaces(
            searchPlacesId
        );
    }

    export function RemoveSearchPlaces(searchPlacesId: string): void {
        OSFramework.Maps.Helper.LogWarningMessage(
            `${OSFramework.Maps.Helper.warningMessage} 'OutSystems.Maps.PlacesAPI.SearchPlacesManager.RemoveSearchPlaces()'`
        );
        OutSystems.Maps.PlacesAPI.SearchPlacesManager.RemoveSearchPlaces(
            searchPlacesId
        );
    }
}
