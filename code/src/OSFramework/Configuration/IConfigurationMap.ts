namespace OSFramework.Configuration {
    /**
     * Used to translate configurations from OS to Provider
     * Defines the basic structure for grid objects
     */
    export interface IConfigurationMap extends IConfiguration {
        advancedFormat: string;
        extendedClass: string;
        height: string;
        location: string;
        offset: OSFramework.OSStructures.OSMap.Offset;
        showTraffic: boolean;
        staticMap: boolean;
        style: OSFramework.Enum.OSMap.Style;
        type: OSFramework.Enum.OSMap.Type;
        uniqueId: string;
        zoom: OSFramework.Enum.OSMap.Zoom;
    }
}
