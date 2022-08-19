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
        addHandler(handler: OSFramework.Maps.Callbacks.Generic, ...args): void;
        hasHandlers(): boolean;
        removeHandler(handler: OSFramework.Maps.Callbacks.Generic): void;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        trigger(data: D, ...args): any;
    }
}
