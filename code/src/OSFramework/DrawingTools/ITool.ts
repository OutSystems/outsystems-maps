// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace OSFramework.DrawingTools {
    export interface ITool
        extends Interface.IBuilder,
            Interface.ISearchById,
            Interface.IDisposable {
        config: Configuration.IConfigurationTool; //IConfigurationDrawingTools
        drawingTools: IDrawingTools;
        isReady: boolean;
        map: OSMap.IMap; //IMap
        type: string;
        uniqueId: string;
        widgetId: string;

        /**
         * Adds the completedElement (completemarker, completepolyline, etc.) event listeners to the correspondent element
         * The new handlers will create the shape/markers elements and remove the overlay created by the drawing tool on the map
         */
        addCompletedEvent(): void;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        changeProperty(propertyName: string, propertyValue: any): void;
    }
}
