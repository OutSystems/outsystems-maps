// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace Provider.Maps.Google.SearchPlaces {
	export namespace SearchPlacesFactory {
		export function MakeSearchPlaces(
			searchPlacesId: string,
			configs: JSON
		): OSFramework.Maps.SearchPlaces.ISearchPlaces {
			return new SearchPlaces(searchPlacesId, configs);
		}
	}
}
