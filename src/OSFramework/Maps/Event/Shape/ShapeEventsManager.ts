// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace OSFramework.Maps.Event.Shape {
	/**
	 * Class that will be responsible for managing the events of the Shapes.
	 *
	 * @export
	 * @class ShapeEventsManager
	 * @extends {AbstractEventsManager<ShapeEventType, string>}
	 */
	export class ShapeEventsManager extends AbstractEventsManager<ShapeEventType, string> {
		private readonly _shape: OSFramework.Maps.Shape.IShape;

		constructor(shape: OSFramework.Maps.Shape.IShape) {
			super();
			this._shape = shape;
		}

		protected getInstanceOfEventType(eventType: ShapeEventType): OSFramework.Maps.Event.IEvent<string> {
			let event: OSFramework.Maps.Event.IEvent<string>;

			switch (eventType) {
				case ShapeEventType.Initialized:
					event = new ShapeInitializedEvent();
					break;
				case ShapeEventType.OnClick:
					event = new ShapeOnClickEvent();
					break;
				default:
					// Validate if google provider has this event before creating the instance of ShapeProviderEvent
					if (this._shape.validateProviderEvent(eventType) === true) {
						event = new ShapeProviderEvent();
						break;
					}
					this._shape.map.mapEvents.trigger(
						OSMap.MapEventType.OnError,
						this._shape.map,
						Enum.ErrorCodes.GEN_UnsupportedEventShape,
						`${eventType}`
					);
					return;
			}
			return event;
		}

		/**
		 * Trigger the specific events depending on the event type specified
		 * @param eventType Type of the event currently supported in the Shape element.
		 * @param value Value to be passed to OS in the type of a string.
		 */
		public trigger(eventType: ShapeEventType, eventInfo?: string, ...args: unknown[]): void {
			// Let's first check if the shape has any events associated
			// If the event type is ProviderEvent than we need to get the handlers for the eventInfo -> name of the event
			// If the event type is not ProviderEvent than we need to get the handlers for the eventType (Initialized, OnError, OnEventTriggered)
			const hasEvents =
				eventType === ShapeEventType.ProviderEvent
					? this.handlers.has(eventInfo as ShapeEventType)
					: this.handlers.has(eventType);
			if (hasEvents) {
				const handlerEvent = this.handlers.get(eventType);

				switch (eventType) {
					case ShapeEventType.Initialized:
					case ShapeEventType.OnClick:
						handlerEvent.trigger(
							this._shape.map.widgetId, // Id of Map block that was initialized
							this._shape.widgetId || this._shape.uniqueId // Id of Shape block that was initialized
						);
						break;
					case ShapeEventType.ProviderEvent:
						// If the event type is ProviderEvent we need to first check if the event info (name of the event) is a valid one for the provider events
						if (this._shape.validateProviderEvent(eventInfo) === true) {
							const handler = this.handlers.get(eventInfo as ShapeEventType);
							handler.trigger(
								this._shape.map.widgetId, // Id of Map block that triggered the event
								this._shape.widgetId || this._shape.uniqueId, // Id of Marker block that triggered the event
								eventInfo, // Name of the event that got triggered
								...args // Coordinates retrieved from the marker event that got triggered
							);
							break;
						}
					// If the event is not valid we can fall in the default case of the switch and throw an error
					// eslint-disable-next-line no-fallthrough
					default:
						this._shape.map.mapEvents.trigger(
							OSMap.MapEventType.OnError,
							this._shape.map,
							Enum.ErrorCodes.GEN_UnsupportedEventMarker,
							`${eventType}`
						);
						return;
				}
			}
		}
	}
}
