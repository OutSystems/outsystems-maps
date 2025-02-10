/**
 * This namespace joins methods that can be used by Maps and Places
 */

// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace Provider.Maps.Google.SharedComponents {
	/**
	 * Class used to manage Google Maps Libraries/Modules
	 *
	 * @export
	 * @class ExternalModules
	 */
	export class ExternalModules {
		private _providerBuildRetryTimeout: number = undefined;
		private readonly _timeoutInterval: number = 100;

		constructor() {
			this._providerBuildRetryTimeout = undefined;
			this._timeoutInterval = 100;
		}

		/**
		 * This method will check if a specifc module exists.
		 * If so will call the pretended callback, if not will retry repeatly until the constant max attemps is reached;
		 * When the max attemps is reached and the module was not found, will call the callback with false value;
		 *
		 * @template T
		 * @param {object} moduleName
		 * @param {(obj: T) => void} cb
		 * @param {unknown} context
		 * @memberof ExternalModules
		 */
		public checkProviderModules<T>(moduleName: () => T, cb: (success: boolean) => void, context: unknown): void {
			let _buildAttempts = 0;

			const attempt = () => {
				this.clearBuildTimeout();
				if (typeof moduleName() === 'object') {
					cb.call(context, true);
				} else if (_buildAttempts < Constants.checkGoogleMapsLibrariesMaxAttempts) {
					_buildAttempts++;
					this._providerBuildRetryTimeout = window.setTimeout(attempt, this._timeoutInterval);
				} else {
					cb.call(context, false);
				}
			};

			attempt();
		}

		/**
		 * This will clean the timeout references used on checkProviderModules method;
		 *
		 * @memberof ExternalModules
		 */
		public clearBuildTimeout(): void {
			if (this._providerBuildRetryTimeout) {
				clearTimeout(this._providerBuildRetryTimeout);
				this._providerBuildRetryTimeout = undefined;
			}
		}
	}
}
