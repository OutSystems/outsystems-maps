// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace Provider.Maps.Google.Version {
	/**
	 * Auxiliary function to get the current version of Google Maps loaded on the page.
	 *
	 * @return {*}  {string}
	 */
	function GetGoogleMapsVersion(): string {
		let version = undefined;
		if (window.google && window.google.maps && window.google.maps.version) {
			const gmVersion = window.google.maps.version;
			const indexMajorMinor = gmVersion.lastIndexOf('.');
			version = gmVersion.substring(0, indexMajorMinor);
		}
		return version;
	}

	/**
	 * Set the version of Google Maps to be used on the page.
	 *
	 * @export
	 * @param {string} newVersion
	 * @return {*}  {boolean}
	 */
	export function Change(newVersion: string): boolean {
		const currentVersion =
			OSFramework.Maps.Helper.LocalStorage.GetItem(Constants.googleMapsLocalStorageVersionKey) ||
			Constants.googleMapsVersion;

		const googleVersion = GetGoogleMapsVersion();

		// If the version that the developer set is different from the current version, and is different from the version loaded, set the return value to true.
		const versionChanged = currentVersion !== newVersion && newVersion !== googleVersion;

		OSFramework.Maps.Helper.LocalStorage.SetItem(Constants.googleMapsLocalStorageVersionKey, newVersion);

		return versionChanged;
	}

	/**
	 * Get the current version of Google Maps loaded on the page.
	 *
	 * @export
	 * @return {*}  {string}
	 */
	export function Get(): string {
		let currentVersion =
			OSFramework.Maps.Helper.LocalStorage.GetItem(Constants.googleMapsLocalStorageVersionKey) ||
			Provider.Maps.Google.Constants.googleMapsVersion;
		const googleVersion = GetGoogleMapsVersion();

		// If the version that the developer set is still not being used, log a warning message and return the current loaded version.
		if (googleVersion !== undefined && currentVersion !== googleVersion) {
			OSFramework.Maps.Helper.LogWarningMessage(
				`Current version of Google Maps loaded is '${googleVersion}', but on the next page refresh the version will tentatively be '${currentVersion}'.`
			);
			currentVersion = googleVersion;
		}

		return currentVersion;
	}
}
