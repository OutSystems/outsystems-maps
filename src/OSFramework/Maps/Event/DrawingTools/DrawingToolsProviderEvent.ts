///<reference path="AbstractDrawingToolsEvent.ts"/>

// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace OSFramework.Maps.Event.DrawingTools {
	/**
	 * Class that represents the DrawingToolsProviderEvent event.
	 *
	 * @class DrawingToolsProviderEvent
	 * @extends {AbstractEvent<string>}
	 */
	export class DrawingToolsProviderEvent extends AbstractDrawingToolsEvent {
		/**
		 * Method that will trigger the event with the correct parameters.
		 * @param mapId Id of the Map that is raising the event
		 * @param drawingToolsId Id of the DrawingTools that is raising the event
		 * @param isNewElement IsNewShape/IsNewMarker (empty if the provider event is not handled by the element creator or changer)
		 * @param coordinates string contaning the shape coordinates
		 * @param location string contaning the shape coordinates and other properties as circle radius
		 */
		public trigger(
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			mapId: string,
			drawingToolsId: string,
			isNewElement: boolean,
			coordinates: OSStructures.OSMap.Coordinates | OSStructures.OSMap.BoundsString,
			location: string
		): void {
			this.handlers
				.slice(0)
				.forEach((h) =>
					Helper.CallbackAsyncInvocation(
						h.eventHandler,
						mapId,
						drawingToolsId,
						isNewElement,
						coordinates,
						location
					)
				);
		}
	}
}
