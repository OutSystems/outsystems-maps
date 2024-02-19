/// <reference path="../../../../OSFramework/Maps/DrawingTools/AbstractTool.ts" />

// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace Provider.Maps.Google.DrawingTools {
	export abstract class AbstractProviderTool<
		T extends OSFramework.Maps.Configuration.IConfigurationTool,
	> extends OSFramework.Maps.DrawingTools.AbstractTool<T> {
		protected newElm;

		private _addCompletedEventHandler(element: google.maps.drawing.DrawingManager): void {
			const uniqueId = OSFramework.Maps.Helper.GenerateUniqueId();
			// create the shape/marker element
			this.newElm = this.createElement(
				uniqueId,
				element,
				// Get the configs to create the shape/marker (elementConfig)
				this.config
			);
			this.drawingTools.createdElements.push(this.newElm);

			const coordinates = this.getCoordinates();
			const location = this.getLocation();

			// Trigger the event of element complete (markercomplete, polylinecomplete, polygoncomplete, etc) with the information of a new element (boolean set to True)
			this.triggerOnDrawingChangeEvent(uniqueId, true, coordinates, location);

			// Make sure to remove the overlays after creating them,
			// Otherwise the following line which will create the shape/marker will be over the overlay of the provider
			element.setMap(null); // unset the map to remove the overlay
		}

		/**
		 * Trigger the event OnDrawingChange from the Tool. This event will be triggered by an onComplete or an onChange event on the elemet
		 *
		 * @param uniqueId uniqueId of the element from which we want to trigger the event
		 * @param isNewElement boolean that indicates if the element is new or not (oncomplete x onchange)
		 */
		protected triggerOnDrawingChangeEvent(
			uniqueId: string,
			isNewElement: boolean,
			coordinates: string,
			location: string | string[]
		): void {
			this.drawingTools.drawingToolsEvents.trigger(
				// EventType
				OSFramework.Maps.Event.DrawingTools.DrawingToolsEventType.ProviderEvent,
				// EventName
				this.completedToolEventName,
				// Extra (marker uniqueId and flag indicating that the element is new)
				{ uniqueId, isNewElement, coordinates, location }
			);
		}

		// Adds the completedElement (completemarker, completepolyline, etc.) event listeners to the correspondent element.
		// The new handlers will create the shape/markers elements and remove the overlay created by the drawing tool on the map
		public addCompletedEvent(): void {
			this.drawingTools.provider.addListener(
				this.completedToolEventName,
				this._addCompletedEventHandler.bind(this)
			);
		}

		public build(): void {
			super.build();

			this.options = this.getProviderConfig();

			this.finishBuild();
		}

		public changeProperty(propertyName: string, value: unknown): void {
			const propValue = OSFramework.Maps.Enum.OS_Config_Shape[propertyName];
			super.changeProperty(propertyName, value);
			if (this.drawingTools.isReady) {
				if (propValue === OSFramework.Maps.Enum.OS_Config_Shape.allowDrag) {
					this.options = { draggable: value };
				}
			}
		}

		public dispose(): void {
			super.dispose();
		}

		public abstract get options(): unknown;
		protected abstract get completedToolEventName(): string;

		protected abstract set options(options: unknown);

		/**
		 * Creates a new element based on the new element provider that results from the marker or shape complete events.
		 *
		 * @param uniqueId uniqueId of the new element
		 * @param element new element provider (shape or marker). The new element results from the marker or shape complete events
		 * @param configs configs to create the new element (on the osframework)
		 */
		protected abstract createElement(uniqueId: string, element: unknown, configs: unknown): void;

		protected abstract getCoordinates(): string;
		protected abstract getLocation(): string | string[];
	}
}
