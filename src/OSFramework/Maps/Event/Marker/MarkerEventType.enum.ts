// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace OSFramework.Maps.Event.Marker {
	/**
	 * Events currently supported in the Marker element.
	 *
	 * @export
	 * @enum {string}
	 */
	export enum MarkerEventType {
		Initialized = 'Initialized',
		// The following events are being deprecated. They will get removed soon.
		/** Events that need to be specified in the advanced format of the Map block (SS) */
		OnEventTriggered = 'OnEventTriggered',
		OnClick = 'OnClick',
		OnMouseover = 'OnMouseover',
		OnMouseout = 'OnMouseout',
		/** Provider events (usually has an event name associated which has been declared with the MapEvent block) */
		ProviderEvent = 'ProviderEvent',
	}
}
