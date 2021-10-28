// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace OSFramework.Configuration {
    /**
     * Used to translate configurations from OS to Provider
     * Defines the basic structure for DrawingTools objects
     */
    export interface IConfigurationHeatmapLayer extends IConfiguration {
        dissipateOnZoom: boolean;
        gradient: Array<string>;
        maxIntensity: number;
        opacity: number;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        points: Array<any>;
        radius: number;
    }
}
