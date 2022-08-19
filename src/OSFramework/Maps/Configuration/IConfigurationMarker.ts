// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace OSFramework.Configuration {
    /**
     * Used to translate configurations from OS to Provider
     * Defines the basic structure for Map objects
     */
    export interface IConfigurationMarker extends IConfiguration {
        allowDrag: boolean;
        iconHeight: number;
        iconUrl: string;
        iconWidth: number;
        location: string;
        title: string;
    }
}
