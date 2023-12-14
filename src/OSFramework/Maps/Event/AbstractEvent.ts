// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace OSFramework.Maps.Event {
    /**
     * Abstract class that will be responsible for the basic behaviours of a link, namely storing the callbacks.
     *
     * @export
     * @abstract
     * @class AbstractEvent
     * @implements {IEvent<T>}
     * @template T
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    export abstract class AbstractEvent<T> implements IEvent<T> {
        private _handlers: IHandler[] = [];

        protected get handlers(): IHandler[] {
            return this._handlers;
        }

        public addHandler(
            handler: Callbacks.Generic,
            eventUniqueId?: string // if it's an internal event, it will not have a uniqueId
        ): void {
            this._handlers.push({
                eventHandler: handler,
                uniqueId: eventUniqueId
            });
        }

        public hasHandlers(): boolean {
            return this._handlers.length > 0;
        }

        public removeHandler(handler: Callbacks.Generic): void {
            const index = this._handlers.findIndex((hd) => {
                return hd.eventHandler === handler;
            });

            if (index !== -1) {
                this._handlers.splice(index, 1);
            }
        }

        // eslint-disable-next-line  @typescript-eslint/no-unused-vars
        public trigger(data?: T, ...args: unknown[]): void {
            this._handlers
                .slice(0)
                .forEach((h) =>
                    Helper.CallbackAsyncInvocation(
                        h.eventHandler,
                        data,
                        ...args
                    )
                );
        }
    }
}
