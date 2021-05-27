// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace OSFramework.Configuration {
    /**
     * Used to translate configurations from OS to Provider
     * Defines the basic structure for Map objects
     */
    export interface IConfigurationMarker extends IConfiguration {
        advancedFormat: string;
        allowDrag: boolean;
        iconUrl: string;
        location: string;
        title: string;
        uniqueId: string;
    }
}
