// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace OSFramework.Helper {
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
    export function CallbackAsyncInvocation(callback: any, ...args: any) {
        if (callback.eventHandler)
            setTimeout(() => callback.eventHandler(...args), 0);
    }
}
