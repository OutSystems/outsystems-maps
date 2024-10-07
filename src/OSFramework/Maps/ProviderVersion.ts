// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace OSFramework.Maps.ProviderVersion {
	/**
	 * Function that allows to get the version of a specific the provider
	 *
	 * @export
	 * @param {OSFramework.Maps.Enum.ProviderType} provider
	 * @return {*}  {string}
	 */
	export function Get(provider: OSFramework.Maps.Enum.ProviderType): string {
		let version = '';
		switch (provider) {
			case OSFramework.Maps.Enum.ProviderType.Google:
				version = Provider.Maps.Google.Version.Get();
				break;
			case OSFramework.Maps.Enum.ProviderType.Leaflet:
				version = Provider.Maps.Leaflet.Version.Get();
				break;
			default:
				throw new Error(`There provider '${provider}' is not supported.`);
		}
		return version;
	}

	/**
	 * Function that allows to set the version of a specific the provider.
	 * If the forceRefresh is set to true and the version has changed, the page will be reloaded.
	 * Otherwise, the version will be updated in the local storage.
	 *
	 * @export
	 * @param {OSFramework.Maps.Enum.ProviderType} provider
	 * @param {string} version
	 * @param {boolean} [forceRefresh=false]
	 */
	export function Set(provider: OSFramework.Maps.Enum.ProviderType, version: string, forceRefresh = false): void {
		let versionChanged = false;
		switch (provider) {
			case OSFramework.Maps.Enum.ProviderType.Google:
				versionChanged = Provider.Maps.Google.Version.Set(version);
				break;
			case OSFramework.Maps.Enum.ProviderType.Leaflet:
				versionChanged = Provider.Maps.Leaflet.Version.Set(version);
				break;
			default:
				throw new Error(`There provider '${provider}' is not supported.`);
		}

		if (forceRefresh && versionChanged) {
			// Force refresh the library
			window.location.reload();
		}
	}
}
