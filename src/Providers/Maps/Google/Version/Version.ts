// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace Provider.Maps.Google.Version {
	/**
	 * Get the current version of Google Maps loaded on the page.
	 *
	 * @export
	 * @return {*}  {string}
	 */
	export function Get(): string {
		let currVersion =
			OSFramework.Maps.Helper.LocalStorage.GetItem(Constants.googleMapsLocalStorageVersionKey) ||
			Provider.Maps.Google.Constants.googleMapsVersion;

		// If the version that the developer set is still not being used, log a warning message and return the current loaded version.
		if (currVersion !== google?.maps?.version) {
			OSFramework.Maps.Helper.LogWarningMessage(
				`Current version of Google Maps loaded is '${google.maps.version}', but on the next page refresh the version will be '${currVersion}'.`
			);
			currVersion = google.maps.version;
		}

		return currVersion;
	}

	/**
	 * Set the version of Google Maps to be used on the page.
	 *
	 * @export
	 * @param {string} newVersion
	 * @return {*}  {boolean}
	 */
	export function Set(newVersion: string): boolean {
		const currentVersion =
			OSFramework.Maps.Helper.LocalStorage.GetItem(Constants.googleMapsLocalStorageVersionKey) ||
			Constants.googleMapsVersion;

		// If the version that the developer set is different from the current version, and is different from the version loaded, set the return value to true.
		const versionChanged = currentVersion !== newVersion && newVersion !== google?.maps?.version;

		OSFramework.Maps.Helper.LocalStorage.SetItem(Constants.googleMapsLocalStorageVersionKey, newVersion);

		return versionChanged;
	}
}
