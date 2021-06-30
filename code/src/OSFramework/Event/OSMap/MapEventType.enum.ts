// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace OSFramework.Event.OSMap {
    /**
     * Events currently supported in the Map element.
     *
     * @export
     * @enum {string}
     */
    export enum MapEventType {
        Initialized = 'Initialized',
        OnError = 'OnError',
        /** Events that need to be specified in the advanced format of the Map block (SS) - Will be deprecated*/
        OnEventTriggered = 'OnEventTriggered',
        /** Provider events (usually has an event name associated which has been declared with the MapEvent block) */
        ProviderEvent = 'ProviderEvent'
    }
}
