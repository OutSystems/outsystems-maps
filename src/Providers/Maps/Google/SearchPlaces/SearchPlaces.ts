/// <reference path="../../../../OSFramework/Maps/SearchPlaces/AbstractSearchPlaces.ts" />

// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace Provider.Maps.Google.SearchPlaces {
	export class SearchPlaces extends OSFramework.Maps.SearchPlaces.AbstractSearchPlaces<
		google.maps.places.PlaceAutocompleteElement,
		OSFramework.Maps.Configuration.IConfigurationSearchPlaces
	> {
		private _addedEvents: Array<string>;
		private _scriptCallback: OSFramework.Maps.Callbacks.Generic;
		protected readonly _searchPlacesTag = OSFramework.Maps.Helper.Constants.searchPlacesTag;

		constructor(searchPlacesId: string, configs: JSON) {
			super(searchPlacesId, new Configuration.SearchPlaces.SearchPlacesConfig(configs));
			this._addedEvents = [];
			this._scriptCallback = this._createGooglePlaces.bind(this);
		}

		// From the structure Bounds (north, south, east, weast) we need to convert the locations into the correct format of bounds
		// For instance (north: string -> north: number)
		private _buildSearchArea(boundsString: string): Promise<OSFramework.Maps.OSStructures.OSMap.Bounds> {
			const searchArea: OSFramework.Maps.OSStructures.OSMap.BoundsString = JSON.parse(boundsString);

			if (OSFramework.Maps.Helper.HasAllEmptyBounds(searchArea)) {
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
			bounds: OSFramework.Maps.OSStructures.OSMap.BoundsString
		): Promise<OSFramework.Maps.OSStructures.OSMap.Bounds> {
			// In case of error converting the string to bounds
			const errorCallback = () => {
				this.searchPlacesEvents.trigger(
					OSFramework.Maps.Event.SearchPlaces.SearchPlacesEventType.OnError,
					this,
					OSFramework.Maps.Enum.ErrorCodes.CFG_InvalidSearchPlacesSearchArea
				);
			};
			return SharedComponents.ConvertStringToBounds(bounds, this.config.apiKey, errorCallback);
		}

		/**
		 * Creates the SearchPlaces via GoogleMap API
		 */
		private _createGooglePlaces(): void {
			// This will prevent the creation of the provider if the component was destroyed
			// while the code was waiting for script callback to be called
			if (this._built === undefined) {
				return;
			}
			this._prepareProviderConfigs(!!google?.maps?.places?.PlaceAutocompleteElement);
		}

		private _createProvider(configs: Configuration.SearchPlaces.ISearchPlacesProviderConfig): void {
			// This is to guarantee that the widget was not disposed before reaching this method
			const placesElement = OSFramework.Maps.Helper.GetElementByUniqueId(this.uniqueId, false);
			if (placesElement !== undefined) {
				// SearchPlaces(input, options)
				this._provider = new google.maps.places.PlaceAutocompleteElement(configs as unknown);
				// Check if the provider has been created with a valid APIKey

				placesElement.appendChild(this.provider);

				window[Constants.googleMapsAuthFailure] = () => {
					this.searchPlacesEvents.trigger(
						OSFramework.Maps.Event.SearchPlaces.SearchPlacesEventType.OnError,
						this,
						OSFramework.Maps.Enum.ErrorCodes.LIB_InvalidApiKeySearchPlaces
					);
				};

				this.finishBuild();
				this._setSearchPlacesEvents();
			}
		}

		/**
		 * Method to guarantee that places library is available before building a new places.Autocomplete
		 *
		 *
		 * @private
		 * @memberof SearchPlaces
		 */
		private _prepareProviderConfigs(isModuleAvailable: boolean): void {
			if (isModuleAvailable) {
				const local_configs =
					this.getProviderConfig() as Configuration.SearchPlaces.ISearchPlacesProviderConfig;
				// If all searchArea bounds are empty, then we don't want to create a searchArea
				// If not, create a searchArea with the bounds that were specified
				// But if one of the bounds is empty, throw an error
				if (OSFramework.Maps.Helper.HasAllEmptyBounds(local_configs.locationRestriction) === false) {
					const bounds = this._convertStringToBounds(local_configs.locationRestriction);
					// If countries > 5 than throw an error
					if (this._validCountriesMaxLength(this.config.countries) && bounds !== undefined) {
						bounds
							.then((coords: OSFramework.Maps.OSStructures.OSMap.Bounds) => {
								local_configs.locationRestriction =
									coords as unknown as OSFramework.Maps.OSStructures.OSMap.BoundsString;
								this._createProvider(local_configs);
							})
							.catch((error) => {
								this.searchPlacesEvents.trigger(
									OSFramework.Maps.Event.SearchPlaces.SearchPlacesEventType.OnError,
									this,
									OSFramework.Maps.Enum.ErrorCodes.LIB_FailedGeocodingSearchAreaLocations,
									undefined,
									`${error}`
								);
							});
					}
				} else {
					delete local_configs.locationRestriction;
					this._createProvider(local_configs);
				}
			} else {
				this.searchPlacesEvents.trigger(
					OSFramework.Maps.Event.SearchPlaces.SearchPlacesEventType.OnError,
					this,
					OSFramework.Maps.Enum.ErrorCodes.LIB_FailedGeocodingSearchAreaLocations,
					undefined,
					`The google.maps.places lib has not been loaded, or the version of Google Maps does not support it. Requires version > "3.59", loaded version is "${Version.Get()}".`
				);
			}
		}

		private _setSearchPlacesEvents(): void {
			SharedComponents.RemoveEventsFromProvider(this);

			// OnPlaceSelect Event
			if (
				this.searchPlacesEvents.hasHandlers(
					OSFramework.Maps.Event.SearchPlaces.SearchPlacesEventType.OnPlaceSelect
				)
			) {
				// Add the event OnPlaceSelect into the addedEvents auxiliar list
				this._addedEvents.push(Constants.SearchPlaces.Events.OnPlaceSelect);
				this._provider.addEventListener(
					Constants.SearchPlaces.Events.OnPlaceSelect,
					// eslint-disable-next-line @typescript-eslint/no-explicit-any
					async ({ placePrediction }: any) => {
						const place = placePrediction.toPlace();
						await place.fetchFields({ fields: ['displayName', 'formattedAddress', 'location'] });
						const spParams: OSFramework.Maps.SearchPlaces.ISearchPlacesEventParams = {
							name: place.displayName,
							coordinates: JSON.stringify({
								Lat: Helper.Conversions.GetCoordinateValue(place.location.lat),
								Lng: Helper.Conversions.GetCoordinateValue(place.location.lng),
							}),
							address: place.formattedAddress,
						};

						this.searchPlacesEvents.trigger(
							OSFramework.Maps.Event.SearchPlaces.SearchPlacesEventType.OnPlaceSelect,
							this, // searchPlacesObj
							Constants.SearchPlaces.Events.OnPlaceSelect, // event name (eventInfo)
							// Extra parameters to be passed as arguments on the callback of the OnPlaceSelect event handler
							spParams
						);
					}
				);
			}
		}

		/** If countries > 5 (as required by Google Maps api), throw an error an return false */
		private _validCountriesMaxLength(countries: Array<string>): boolean {
			if (countries.length > 5) {
				this.searchPlacesEvents.trigger(
					OSFramework.Maps.Event.SearchPlaces.SearchPlacesEventType.OnError,
					this,
					OSFramework.Maps.Enum.ErrorCodes.CFG_MaximumCountriesNumber
				);
				return false;
			}

			return true;
		}

		/** If input is not valid (doesn't exist) throw an error and return false */
		private _validInput(input: HTMLInputElement): boolean {
			if (input === undefined) {
				this.searchPlacesEvents.trigger(
					OSFramework.Maps.Event.SearchPlaces.SearchPlacesEventType.OnError,
					this,
					OSFramework.Maps.Enum.ErrorCodes.CFG_InvalidInputSearchPlaces
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
			SharedComponents.InitializeScripts(this.config.apiKey, this.config.localization, this._scriptCallback);
		}

		public changeProperty(propertyName: string, propertyValue: unknown): void {
			super.changeProperty(propertyName, propertyValue);
			if (this.isReady) {
				switch (OSFramework.Maps.Enum.OS_Config_SearchPlaces[propertyName]) {
					case OSFramework.Maps.Enum.OS_Config_SearchPlaces.apiKey:
						if (this.config.apiKey !== '') {
							this.searchPlacesEvents.trigger(
								OSFramework.Maps.Event.SearchPlaces.SearchPlacesEventType.OnError,
								this,
								OSFramework.Maps.Enum.ErrorCodes.CFG_APIKeyAlreadySetSearchPlaces
							);
						}
						break;
					case OSFramework.Maps.Enum.OS_Config_SearchPlaces.localization:
						// Trigger an error to alert the user that the localization can only be set one time
						this.searchPlacesEvents.trigger(
							OSFramework.Maps.Event.SearchPlaces.SearchPlacesEventType.OnError,
							this,
							OSFramework.Maps.Enum.ErrorCodes.CFG_LocalizationAlreadySetMap
						);
						break;
					case OSFramework.Maps.Enum.OS_Config_SearchPlaces.searchArea:
						// eslint-disable-next-line no-case-declarations
						const searchArea = this._buildSearchArea(propertyValue as string);
						// If searchArea is undefined (should be a promise) -> don't apply the searchArea (bounds)
						if (searchArea !== undefined) {
							searchArea
								.then((bounds) => {
									this.provider.locationBias = bounds;
									// Make sure the strictBounds are set to True whenever the searchArea changes
								})
								.catch((error) => {
									this.searchPlacesEvents.trigger(
										OSFramework.Maps.Event.SearchPlaces.SearchPlacesEventType.OnError,
										this,
										OSFramework.Maps.Enum.ErrorCodes.CFG_InvalidSearchPlacesSearchArea,
										undefined,
										`${error}`
									);
								});
						} else {
							// Remove the bounds from the SearchPlaces and the strictBounds parameter
							this.provider.locationBias = undefined;
						}
						break;
					case OSFramework.Maps.Enum.OS_Config_SearchPlaces.countries:
						// eslint-disable-next-line no-case-declarations
						const countries = JSON.parse(propertyValue as string) as Array<string>;
						// If validation returns false -> do nothing
						// Else set restrictions to component (apply countries)

						this._validCountriesMaxLength(countries) &&
							// The types of Google Maps are outdated, so we need to cast it to any.
							// eslint-disable-next-line @typescript-eslint/no-explicit-any
							((this.provider as any).includedRegionCodes = countries);
						break;
					case OSFramework.Maps.Enum.OS_Config_SearchPlaces.searchType:
						// The types of Google Maps are outdated, so we need to cast it to any.
						// eslint-disable-next-line @typescript-eslint/no-explicit-any
						(this.provider as any).includedPrimaryTypes = [
							Provider.Maps.Google.SearchPlaces.SearchTypes[propertyValue as string],
						];
						break;
				}
			}
		}

		public dispose(): void {
			this._provider = undefined;
			this._scriptCallback = undefined;
			this._addedEvents = undefined;
			super.dispose();
		}
	}
}
