// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace OSFramework.Configuration {
    /**
     * Used to translate configurations from OS to Provider
     * Defines the basic structure for Map objects
     */
    export interface IConfigurationMap extends IConfiguration {
        advancedFormat: string;
        apiKey: string;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        center: any;
        height: string;
        offset: OSStructures.OSMap.Offset;
        showTraffic: boolean;
        staticMap: boolean;
        style: Enum.OSMap.Style;
        type: Enum.OSMap.Type;
        uniqueId: string;
        zoom: Enum.OSMap.Zoom;
    }
}
