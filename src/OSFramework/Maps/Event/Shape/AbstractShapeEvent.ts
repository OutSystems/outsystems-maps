// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace OSFramework.Event.Shape {
    /**
     * Class that will make sure that the trigger invokes the handlers
     * with the correct parameters.
     *
     * @abstract
     * @class AbstractShapeEvent
     * @extends {AbstractEvent<string>}
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    export abstract class AbstractShapeEvent extends AbstractEvent<string> {
        // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
        public trigger(
            mapId: string,
            shapeId: string,
            // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
            ...args: any
        ): void {
            this.handlers
                .slice(0)
                .forEach((h) =>
                    Helper.CallbackAsyncInvocation(h, mapId, shapeId, ...args)
                );
        }
    }
}
