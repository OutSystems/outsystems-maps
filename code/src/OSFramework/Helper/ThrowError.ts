// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace OSFramework.Helper {
    export function ThrowError(
        map: OSMap.IMap,
        errorCode: Enum.ErrorCodes,
        extra?: string
    ): void {
        map.mapEvents.trigger(
            Event.OSMap.MapEventType.OnError,
            map,
            errorCode,
            extra
        );
    }
}
