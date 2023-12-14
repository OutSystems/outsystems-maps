// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace OSFramework.Maps.Helper {
    /**
     * Validates if value is a valid number.
     *
     * @export
     * @param {unknown} value
     * @return {*}  {boolean}
     */
    export function IsValidNumber(value: unknown): boolean {
        return !isNaN(value as number);
    }
}
