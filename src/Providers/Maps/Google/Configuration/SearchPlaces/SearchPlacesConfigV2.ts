/// <reference path="../../../../../OSFramework/Maps/Configuration/AbstractConfiguration.ts" />
/// <reference path="./AbstractSearchPlacesConfig.ts" />

// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace Provider.Maps.Google.Configuration.SearchPlaces {
	export class SearchPlacesConfigV2 extends AbstractSearchPlacesConfig {
		public getProviderConfig(): ISearchPlacesProviderConfigV2 {
			// eslint-disable-next-line prefer-const
			let provider: ISearchPlacesProviderConfigV2 = {
				locationBias: this.searchArea
					? ({
							east: Number(this.searchArea.east),
							north: Number(this.searchArea.north),
							south: Number(this.searchArea.south),
							west: Number(this.searchArea.west),
						} as google.maps.places.LocationBias)
					: undefined,
				includedRegionCodes: this.countries ?? undefined,
				includedPrimaryTypes: this.searchType
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
