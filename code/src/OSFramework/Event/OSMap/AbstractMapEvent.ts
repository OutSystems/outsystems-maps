///<reference path="../AbstractEvent.ts"/>
// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace OSFramework.Event.OSMap {
    /**
     * Class that will make sure that the trigger invokes the handlers
     * with the correct parameters.
     *
     * @abstract
     * @class AbstractMapEvent
     * @extends {AbstractEvent<OSFramework.OSMap.IMap>}
     */
    export abstract class AbstractMapEvent extends AbstractEvent<OSFramework.OSMap.IMap> {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        public trigger(
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            mapObj: OSFramework.OSMap.IMap,
            mapId: string,
            // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
            ...args: any
        ): void {
            this.handlers
                .slice(0)
                .forEach((h) =>
                    Helper.AsyncInvocation(h, mapObj, mapId, ...args)
                );
        }
    }
}
