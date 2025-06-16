/// <reference path="../../../../../OSFramework/Maps/Configuration/AbstractConfiguration.ts" />
/// <reference path="./AbstractSearchPlacesConfig.ts" />

// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace Provider.Maps.Google.Configuration.SearchPlaces {
	export class SearchPlacesConfigV1 extends AbstractSearchPlacesConfig {
		public getProviderConfig(): ISearchPlacesProviderConfigV1 {
			// eslint-disable-next-line prefer-const
			let provider: ISearchPlacesProviderConfigV1 = {
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
