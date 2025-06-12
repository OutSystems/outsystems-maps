// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace Provider.Maps.Google.Configuration.SearchPlaces {
	export interface ISearchPlacesProviderConfig {
		bounds?: OSFramework.Maps.OSStructures.OSMap.BoundsString;
		componentRestrictions: { country: string[] };
		strictBounds?: boolean;
		types: [Google.SearchPlaces.SearchTypes];
	}
}
