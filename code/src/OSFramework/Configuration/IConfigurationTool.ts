// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace OSFramework.Configuration {
    /**
     * Used to translate configurations from OS to Provider
     * Defines the basic structure for each Tool object from the DrawingTools
     */
    export interface IConfigurationTool extends IConfiguration {
        uniqueId: string;
    }
}
