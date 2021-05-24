// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace OSFramework.Configuration {
    /**
     * Used to translate configurations from OS to Provider
     * Defines the basic structure for Map objects
     */
    export interface IConfigurationMap extends IConfiguration {
        apiKey: string;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        center: any;
        height: string;
        type: Enum.OSMap.Type;
        uniqueId: string;
        zoom: Enum.OSMap.Zoom;
    }
}
