// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace Provider.Google.SearchPlaces {
    export namespace SearchPlacesFactory {
        export function MakeSearchPlaces(
            searchPlacesId: string,
            configs: OSFramework.Configuration.IConfiguration
        ): OSFramework.SearchPlaces.ISearchPlaces {
            return new SearchPlaces(
                searchPlacesId,
                configs as Configuration.SearchPlaces.SearchPlacesConfig
            );
        }
    }
}
