// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace OSFramework.Maps.Helper {
    export function CallbackAsyncInvocation(
        callback: Callbacks.Generic,
        ...args: unknown[]
    ): void {
        if (callback) {
            setTimeout(callback, 0, ...args);
        }
    }
}
