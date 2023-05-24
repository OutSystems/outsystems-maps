// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace Provider.Maps.Google.SearchPlaces {
    export namespace SearchPlacesFactory {
        export function MakeSearchPlaces(
            searchPlacesId: string,
            configs: OSFramework.Maps.Configuration.IConfiguration
        ): OSFramework.Maps.SearchPlaces.ISearchPlaces {
            return new SearchPlaces(
                searchPlacesId,
                configs as Configuration.SearchPlaces.SearchPlacesConfig
            );
        }
    }
}
