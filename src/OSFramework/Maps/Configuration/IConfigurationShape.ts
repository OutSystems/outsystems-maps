// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace OSFramework.Maps.Configuration {
	/**
	 * Used to translate configurations from OS to Provider
	 * Defines the basic structure for Map objects
	 */
	export interface IConfigurationShape extends IConfiguration {
		allowDrag: boolean;
		allowEdit: boolean;
		locations: string;
		strokeColor: string;
		strokeOpacity: number;
		strokeWeight: number;
	}
}
