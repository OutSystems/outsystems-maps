/// <reference path="../../../../../OSFramework/Maps/Configuration/AbstractConfiguration.ts" />

// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace Provider.Maps.Google.Configuration.SearchPlaces {
	export class SearchPlacesConfig
		extends OSFramework.Maps.Configuration.AbstractConfiguration
		implements OSFramework.Maps.Configuration.IConfigurationSearchPlaces
	{
		public apiKey: string;
		public countries: Array<string>;
		public localization: OSFramework.Maps.OSStructures.OSMap.Localization;
		public searchArea: OSFramework.Maps.OSStructures.OSMap.BoundsString;
		public searchType: OSFramework.Maps.Enum.SearchTypes;

		public getProviderConfig(): ISearchPlacesProviderConfig {
			// eslint-disable-next-line prefer-const
			let provider: ISearchPlacesProviderConfig = {
				bounds: this.searchArea,
				strictBounds: !!this.searchArea,
				componentRestrictions: this.countries ? { country: this.countries } : undefined,
				types: this.searchType
					? // eslint-disable-next-line @typescript-eslint/no-unused-vars
						[Google.SearchPlaces.SearchTypes[this.searchType]]
					: undefined,
			};

			//Cleanning undefined properties
			Object.keys(provider).forEach((key) => {
				if (provider[key] === undefined) {
					delete provider[key];
				}
			});

			return provider;
		}
	}
}
