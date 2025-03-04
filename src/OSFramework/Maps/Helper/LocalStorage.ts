namespace OSFramework.Maps.Helper.LocalStorage {
	/**
	 * Get an item from the local storage.
	 *
	 * @export
	 * @param {string} key
	 * @return {*}  {string}
	 */
	export function GetItem(key: string): string {
		return window.localStorage.getItem(key);
	}

	/**
	 * Checks if an item exists in the local storage.
	 *
	 * @export
	 * @param {string} key
	 * @return {*}  {boolean}
	 */
	export function HasItem(key: string): boolean {
		return window.localStorage.getItem(key) !== null;
	}

	/**
	 * Set an item in the local storage.
	 *
	 * @export
	 * @param {string} key
	 * @param {string} value
	 */
	export function SetItem(key: string, value: string): void {
		window.localStorage.setItem(key, value);
	}
}
