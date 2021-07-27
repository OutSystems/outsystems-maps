// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace OSFramework.Configuration {
    /**
     * Used to translate configurations from OS to Provider
     * Defines the basic structure for Map objects
     */
    export interface IConfigurationShape extends IConfiguration {
        allowClick: boolean;
        allowDrag: boolean;
        allowEdit: boolean;
        color: string;
        locations: string;
        opacity: number;
        uniqueId: string;
        weight: number;
    }
}
