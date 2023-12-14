// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace OSFramework.Maps.Event {
    /**
     * This interface is the base to all events. All events (both internal or external)
     * need to implement it.
     *
     * @export
     * @interface IEvent
     * @template D this will the type of Data to be passed, by default to the handlers.
     */
    export interface IEvent<D> {
        addHandler(
            handler: OSFramework.Maps.Callbacks.Generic,
            ...args: unknown[]
        ): void;
        hasHandlers(): boolean;
        removeHandler(handler: OSFramework.Maps.Callbacks.Generic): void;
        trigger(data: D, ...args: unknown[]): unknown;
    }
}
