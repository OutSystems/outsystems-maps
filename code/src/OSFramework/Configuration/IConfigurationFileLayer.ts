// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace OSFramework.Configuration {
    /**
     * Used to translate configurations from OS to Provider
     * Defines the basic structure for DrawingTools objects
     */
    export interface IConfigurationFileLayer extends IConfiguration {
        allowClick: boolean;
        layerUrl: string;
        preserveViewport: boolean;
        suppressPopups: boolean;
        uniqueId: string;
    }
}
