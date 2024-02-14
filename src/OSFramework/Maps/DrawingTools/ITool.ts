// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace OSFramework.Maps.DrawingTools {
	export interface ITool extends Interface.IBuilder, Interface.ISearchById, Interface.IDisposable {
		config: Configuration.IConfigurationTool; //IConfigurationDrawingTools
		drawingTools: IDrawingTools;
		isReady: boolean;
		map: OSMap.IMap; //IMap
		options: unknown;
		type: string;
		uniqueId: string;
		widgetId: string;

		/**
		 * Adds the completedElement (completemarker, completepolyline, etc.) event listeners to the correspondent element
		 * The new handlers will create the shape/markers elements and remove the overlay created by the drawing tool on the map
		 * @param e is only used by the leaflet implementation, is used to access the configs info on the creation of a new shape/marker
		 */
		addCompletedEvent(e?: unknown): void;
		changeProperty(propertyName: string, propertyValue: unknown): void;
	}
}
