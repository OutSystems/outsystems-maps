/// <reference path="../../../OSFramework/SearchPlaces/AbstractSearchPlaces.ts" />

// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace Provider.Google.SearchPlaces {
    export class SearchPlaces extends OSFramework.SearchPlaces
        .AbstractSearchPlaces<
        google.maps.places.Autocomplete,
        OSFramework.Configuration.IConfigurationSearchPlaces
    > {
        private _addedEvents: Array<string>;
        private _scriptCallback: OSFramework.Callbacks.Generic;

        constructor(
            searchPlacesId: string,
            // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
            configs: any
        ) {
            super(
                searchPlacesId,
                new Configuration.SearchPlaces.SearchPlacesConfig(configs)
            );
            this._addedEvents = [];
            this._scriptCallback = this._createGooglePlaces.bind(this);
        }

        // From the structure Bounds (north, south, east, weast) we need to convert the locations into the correct format of bounds
        // For instance (north: string -> north: number)
        private _buildSearchArea(
            boundsString: string
        ): Promise<OSFramework.OSStructures.OSMap.Bounds> {
            const searchArea: OSFramework.OSStructures.OSMap.BoundsString =
                JSON.parse(boundsString);

            if (OSFramework.Helper.HasAllEmptyBounds(searchArea)) {
                return undefined;
            }

            // this method will then return a promise that will be resolved on the _buildProvider
            return this._convertStringToBounds(searchArea);
        }

        /** This method will help converting the bounds (string) into the respective coordinates that will be used on the bounds
         * It returns a promise because bounds will get converted into coordinates
         * The method resposible for this conversion (Helper.Conversions.ConvertToCoordinates) also returns a Promise
         * This Promise will only get resolved after the provider gets built (asynchronously)
         */
        private _convertStringToBounds(
            bounds: OSFramework.OSStructures.OSMap.BoundsString
        ): Promise<OSFramework.OSStructures.OSMap.Bounds> {
            // In case of error converting the string to bounds
            const errorCallback = () => {
                this.searchPlacesEvents.trigger(
                    OSFramework.Event.SearchPlaces.SearchPlacesEventType
                        .OnError,
                    this,
                    OSFramework.Enum.ErrorCodes
                        .CFG_InvalidSearchPlacesSearchArea
                );
            };
            return SharedComponents.ConvertStringToBounds(
                bounds,
                this.config.apiKey,
                errorCallback
            );
        }

        /**
         * Creates the SearchPlaces via GoogleMap API
         */
        private _createGooglePlaces(): void {
            const script = document.getElementById(
                OSFramework.Helper.Constants.googleMapsScript
            ) as HTMLScriptElement;

            // Make sure the GoogleMaps script in the <head> of the html page contains the same apiKey as the one in the configs.
            const apiKey = /key=(.*)&libraries/.exec(script.src)[1];
            if (this.config.apiKey !== apiKey) {
                return this.searchPlacesEvents.trigger(
                    OSFramework.Event.SearchPlaces.SearchPlacesEventType
                        .OnError,
                    this,
                    OSFramework.Enum.ErrorCodes
                        .CFG_APIKeyDiffersFromPlacesToMaps
                );
            }

            if (this._scriptCallback !== undefined) {
                script.removeEventListener('load', this._scriptCallback);
            }
            if (typeof google === 'object' && typeof google.maps === 'object') {
                const configs = this.getProviderConfig();
                // If all searchArea bounds are empty, then we don't want to create a searchArea
                // If not, create a searchArea with the bounds that were specified
                // But if one of the bounds is empty, throw an error
                if (
                    OSFramework.Helper.HasAllEmptyBounds(configs.bounds) ===
                    false
                ) {
                    const bounds = this._convertStringToBounds(configs.bounds);
                    // If countries > 5 than throw an error
                    if (
                        this._validCountriesMaxLength(this.config.countries) &&
                        bounds !== undefined
                    ) {
                        bounds
                            .then((coords) => {
                                configs.bounds = coords;
                                this._createProvider(configs);
                            })
                            .catch((error) => {
                                this.searchPlacesEvents.trigger(
                                    OSFramework.Event.SearchPlaces
                                        .SearchPlacesEventType.OnError,
                                    this,
                                    OSFramework.Enum.ErrorCodes
                                        .LIB_FailedGeocodingSearchAreaLocations,
                                    `${error}`
                                );
                            });
                    }
                } else {
                    delete configs.bounds;
                    this._createProvider(configs);
                }
            } else {
                throw Error(`The google.maps lib has not been loaded.`);
            }
        }

        // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
        private _createProvider(
            configs: google.maps.places.AutocompleteOptions
        ): void {
            const input: HTMLInputElement =
                OSFramework.Helper.GetElementByUniqueId(
                    this.uniqueId
                ).querySelector(
                    `${OSFramework.Helper.Constants.runtimeSearchPlacesUniqueIdCss} input`
                );
            if (this._validInput(input) === false) return;

            // SearchPlaces(input, options)
            this._provider = new google.maps.places.Autocomplete(
                input,
                configs
            );
            // Check if the provider has been created with a valid APIKey
            window[OSFramework.Helper.Constants.googleMapsAuthFailure] = () =>
                this.searchPlacesEvents.trigger(
                    OSFramework.Event.SearchPlaces.SearchPlacesEventType
                        .OnError,
                    this,
                    OSFramework.Enum.ErrorCodes.LIB_InvalidApiKeySearchPlaces
                );

            this.finishBuild();
            this._setSearchPlacesEvents();
        }

        private _setSearchPlacesEvents(): void {
            SharedComponents.RemoveEventsFromProvider(this);

            // OnPlaceSelect Event
            if (
                this.searchPlacesEvents.hasHandlers(
                    OSFramework.Event.SearchPlaces.SearchPlacesEventType
                        .OnPlaceSelect
                )
            ) {
                // Add the event OnPlaceSelect into the addedEvents auxiliar list
                this._addedEvents.push(
                    Constants.SearchPlaces.Events.OnPlaceSelect
                );
                this._provider.addListener(
                    Constants.SearchPlaces.Events.OnPlaceSelect,
                    () => {
                        const place = this._provider.getPlace();
                        place.geometry &&
                            this.searchPlacesEvents.trigger(
                                OSFramework.Event.SearchPlaces
                                    .SearchPlacesEventType.OnPlaceSelect,
                                this, // searchPlacesObj
                                Constants.SearchPlaces.Events.OnPlaceSelect, // event name (eventInfo)
                                // Extra parameters to be passed as arguments on the callback of the OnPlaceSelect event handler
                                {
                                    name: place.name,
                                    coordinates: JSON.stringify({
                                        Lat: place.geometry.location.lat(),
                                        Lng: place.geometry.location.lng()
                                    }),
                                    address: place.formatted_address
                                }
                            );
                    }
                );
            }
        }

        /** If countries > 5 (as required by google maps api), throw an error an return false */
        private _validCountriesMaxLength(countries: Array<string>): boolean {
            if (countries.length > 5) {
                this.searchPlacesEvents.trigger(
                    OSFramework.Event.SearchPlaces.SearchPlacesEventType
                        .OnError,
                    this,
                    OSFramework.Enum.ErrorCodes.CFG_MaximumCountriesNumber
                );
                return false;
            }

            return true;
        }

        /** If input is not valid (doesn't exist) throw an error and return false */
        private _validInput(input: HTMLInputElement): boolean {
            if (input === undefined) {
                this.searchPlacesEvents.trigger(
                    OSFramework.Event.SearchPlaces.SearchPlacesEventType
                        .OnError,
                    this,
                    OSFramework.Enum.ErrorCodes.CFG_InvalidInputSearchPlaces
                );
                return false;
            }

            return true;
        }

        // Useful when using shared Component methods (Maps and SearchPlaces)
        public get addedEvents(): Array<string> {
            return this._addedEvents;
        }

        public build(): void {
            super.build();

            /**
             * Initializes the Google SearchPlaces.
             * 1) Add the script from GoogleAPIS to the header of the page
             * 2) Creates the SearchPlaces via GoogleMap API
             */
            SharedComponents.InitializeScripts(
                this.config.apiKey,
                this._scriptCallback
            );
        }

        // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
        public changeProperty(propertyName: string, value: any): void {
            super.changeProperty(propertyName, value);
            if (this.isReady) {
                switch (OSFramework.Enum.OS_Config_SearchPlaces[propertyName]) {
                    case OSFramework.Enum.OS_Config_SearchPlaces.apiKey:
                        if (this.config.apiKey !== '') {
                            this.searchPlacesEvents.trigger(
                                OSFramework.Event.SearchPlaces
                                    .SearchPlacesEventType.OnError,
                                this,
                                OSFramework.Enum.ErrorCodes
                                    .CFG_APIKeyAlreadySetSearchPlaces
                            );
                        }
                        return;
                    case OSFramework.Enum.OS_Config_SearchPlaces.searchArea:
                        // eslint-disable-next-line no-case-declarations
                        const searchArea = this._buildSearchArea(value);
                        // If searchArea is undefined (should be a promise) -> don't apply the searchArea (bounds)
                        if (searchArea !== undefined) {
                            searchArea
                                .then((bounds) => {
                                    this.provider.setBounds(bounds);
                                    // Make sure the strictBounds are set to True whenever the searchArea changes
                                    this.provider.set('strictBounds', true);
                                })
                                .catch((error) => {
                                    this.searchPlacesEvents.trigger(
                                        OSFramework.Event.SearchPlaces
                                            .SearchPlacesEventType.OnError,
                                        this,
                                        OSFramework.Enum.ErrorCodes
                                            .CFG_InvalidSearchPlacesSearchArea,
                                        `${error}`
                                    );
                                });
                        } else {
                            // Remove the bounds from the SearchPlaces and the strictBounds parameter
                            this.provider.set('bounds', null);
                            this.provider.set('strictBounds', false);
                        }
                        return;
                    case OSFramework.Enum.OS_Config_SearchPlaces.countries:
                        // eslint-disable-next-line no-case-declarations
                        const countries = JSON.parse(value);
                        // If validation returns false -> do nothing
                        // Else set restrictions to component (apply countries)
                        return (
                            this._validCountriesMaxLength(countries) &&
                            this.provider.setComponentRestrictions({
                                country: countries
                            })
                        );
                    case OSFramework.Enum.OS_Config_SearchPlaces.searchType:
                        return this.provider.setTypes([
                            // eslint-disable-next-line @typescript-eslint/no-unused-vars
                            Provider.Google.SearchPlaces.SearchTypes[value]
                        ]);
                }
            }
        }

        public dispose(): void {
            this._provider = undefined;
            super.dispose();
        }
    }
}
