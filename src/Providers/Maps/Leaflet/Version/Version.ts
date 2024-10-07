// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace Provider.Maps.Leaflet.Version {
	/**
	 * Get the current version of Google Maps loaded on the page.
	 *
	 * @export
	 * @return {*}  {string}
	 */
	export function Get(): string {
		return Constants.leafletVersion;
	}

	/**
	 * Set the version of Google Maps to be used on the page.
	 * Currently, changing the version of Leaflet is not supported.
	 *
	 * @export
	 * @param {string} newVersion
	 * @return {*}  {boolean}
	 */
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	export function Set(newVersion: string): boolean {
		OSFramework.Maps.Helper.LogWarningMessage('Changing Leaflet version is not supported');
		return false;
	}
}
