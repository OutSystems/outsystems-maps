/**
 * Namespace that contains the signatures of the callbacks in OutSystems code.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace OSFramework.Maps.Callbacks {
    /**
     * This is the most generic callback signature and can be used even for internal events
     */
    export type Generic = (...ags: unknown[]) => unknown;

    /**
     * This is the most generic callback signature for events existing in OutSystems code.
     * @param {string} mapID enables the OutSystems code to understand which map triggered the event
     */
    export type OSGeneric = (mapID: string, ...args: unknown[]) => void;
}
