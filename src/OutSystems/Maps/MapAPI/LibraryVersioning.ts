// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace OutSystems.Maps.MapAPI.ProviderLibrary {
	/**
	 * API that allows to get the version of the provider
	 *
	 * @export
	 * @param {OSFramework.Maps.Enum.ProviderType} provider
	 * @return {*}  {string}
	 */
	export function GetVersion(provider: OSFramework.Maps.Enum.ProviderType): string {
		return OSFramework.Maps.ProviderVersion.Get(provider);
	}

	/**
	 * API that allows to set the version of the provider
	 *
	 * @export
	 * @param {OSFramework.Maps.Enum.ProviderType} provider
	 * @param {string} version
	 * @param {boolean} [forceRefresh=false]
	 */
	export function SetVersion(
		provider: OSFramework.Maps.Enum.ProviderType,
		version: string,
		forceRefresh = false
	): void {
		OSFramework.Maps.ProviderVersion.Change(provider, version, forceRefresh);
	}
}
