// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace OSFramework.Maps.Configuration {
	export abstract class AbstractConfiguration implements IConfiguration {
		constructor(config: unknown) {
			const _localConfig = config as unknown[];
			let key;
			for (key in _localConfig) {
				if (_localConfig[key] !== undefined) {
					this[key] = _localConfig[key];
				}
			}
		}

		public abstract getProviderConfig(): unknown;
	}
}
