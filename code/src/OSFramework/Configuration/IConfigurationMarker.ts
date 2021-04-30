namespace OSFramework.Configuration {
    /**
     * Used to translate configurations from OS to Provider
     * Defines the basic structure for grid objects
     */
    export interface IConfigurationMarker extends IConfiguration {
        advancedFormat: string;
        iconURL: string;
        location: OSFramework.OSStructures.OSMap.Coordinates;
        uniqueId: string;
    }
}
