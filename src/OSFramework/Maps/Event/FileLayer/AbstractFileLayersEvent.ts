// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace OSFramework.Maps.Event.FileLayer {
	/**
	 * Class that will make sure that the trigger invokes the handlers
	 * with the correct parameters.
	 *
	 * @abstract
	 * @class AbstractShapeEvent
	 * @extends {AbstractEvent<string>}
	 */
	export abstract class AbstractFileLayersEvent extends AbstractEvent<string> {
		public trigger(mapId: string, fileLayerId: string, ...args: unknown[]): void {
			this.handlers
				.slice(0)
				.forEach((h) => Helper.CallbackAsyncInvocation(h.eventHandler, mapId, fileLayerId, ...args));
		}
	}
}
