// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace OSFramework.Helper {
    export function ThrowError(
        map: OSMap.IMap,
        errorCode: Enum.ErrorCodes,
        extraMessage?: string | Error
    ): void {
        map.mapEvents.trigger(
            Event.OSMap.MapEventType.OnError,
            map,
            errorCode,
            // If extraMessage is undefined then we want to return an empty string
            `${extraMessage || ''}`
        );
    }
}
