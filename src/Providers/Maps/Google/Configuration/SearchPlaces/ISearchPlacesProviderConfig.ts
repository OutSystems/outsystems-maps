// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace Provider.Maps.Google.Configuration.SearchPlaces {
	export interface ISearchPlacesProviderConfig {
		includedPrimaryTypes?: [Google.SearchPlaces.SearchTypes];
		includedRegionCodes?: string[];
		locationBias: google.maps.places.LocationBias;
		locationRestriction?: OSFramework.Maps.OSStructures.OSMap.BoundsString;
		name?: string;
		requestedLanguage?: string;
	}
}
