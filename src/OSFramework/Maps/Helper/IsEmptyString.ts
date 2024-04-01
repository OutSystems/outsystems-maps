// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace OSFramework.Maps.Helper {
	/** Validates if the string is empty */
	export function IsEmptyString(text: string): boolean {
		return typeof text !== 'string' || text === '' || text.trim().length === 0;
	}
}
