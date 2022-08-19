// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace OSFramework.Maps.Configuration {
    /**
     * Used to translate configurations from OS to Provider
     * Defines the basic structure for SearchPlaces objects
     */
    export interface IConfigurationSearchPlaces extends IConfiguration {
        apiKey: string;
        countries: Array<string>;
        searchArea: OSStructures.OSMap.BoundsString;
        searchType: Enum.SearchTypes;
    }
}
