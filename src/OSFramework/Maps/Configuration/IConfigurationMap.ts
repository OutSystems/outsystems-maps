// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace OSFramework.Maps.Configuration {
	/**
	 * Used to translate configurations from OS to Provider
	 * Defines the basic structure for Map objects
	 */
	export interface IConfigurationMap extends IConfiguration {
		apiKey?: string;
		autoZoomOnShapes?: boolean;
		center: string | OSStructures.OSMap.Coordinates;
		height: string;
		respectUserPosition?: boolean;
		respectUserZoom?: boolean;
		type?: Enum.OSMap.Type;
		uniqueId: string;
		zoom: Enum.OSMap.Zoom;
	}
}
