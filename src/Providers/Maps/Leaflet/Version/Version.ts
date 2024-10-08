// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace Provider.Maps.Leaflet.Version {
	/**
	 * Set the version of Google Maps to be used on the page.
	 * Currently, changing the version of Leaflet is not supported.
	 *
	 * @export
	 * @param {string} newVersion
	 * @return {*}  {boolean}
	 */
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	export function Change(newVersion: string): boolean {
		OSFramework.Maps.Helper.LogWarningMessage(
			`Changing Leaflet version is not supported. Using version '${Constants.leafletVersion}'.`
		);
		return false;
	}

	/**
	 * Get the current version of Google Maps loaded on the page.
	 *
	 * @export
	 * @return {*}  {string}
	 */
	export function Get(): string {
		return Constants.leafletVersion;
	}
}
