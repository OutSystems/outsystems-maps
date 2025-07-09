// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace Provider.Maps.Google.SearchPlaces {
	export namespace SearchPlacesFactory {
		export function MakeSearchPlaces(
			searchPlacesId: string,
			configs: JSON,
			searchPlacesVersion: string
		): OSFramework.Maps.SearchPlaces.ISearchPlaces {
			switch (searchPlacesVersion) {
				case Enum.SearchPlacesApiVersion.v1:
					return new SearchPlacesLegacy(searchPlacesId, configs);
				case Enum.SearchPlacesApiVersion.v2:
					return new SearchPlaces(searchPlacesId, configs);
				default:
					throw new Error(`There is no factory for this Google Places API version (${searchPlacesVersion})`);
			}
		}
	}
}
