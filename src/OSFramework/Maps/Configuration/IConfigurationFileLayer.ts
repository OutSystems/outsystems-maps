// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace OSFramework.Maps.Configuration {
	/**
	 * Used to translate configurations from OS to Provider
	 * Defines the basic structure for DrawingTools objects
	 */
	export interface IConfigurationFileLayer extends IConfiguration {
		layerUrl: string;
		preserveViewport: boolean;
		suppressPopups: boolean;
	}
}
