/// <reference path="../../../../OSFramework/Maps/DrawingTools/AbstractTool.ts" />

// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace Provider.Maps.Leaflet.DrawingTools {
    export abstract class AbstractProviderTool<
        T extends OSFramework.Maps.Configuration.IConfigurationTool
    > extends OSFramework.Maps.DrawingTools.AbstractTool<T> {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        protected internalOptions: any; //TODO: create structure for this (repeatmode:,editable ..., shapeOptions:{???})
        protected newElm;

        constructor(
            map: OSFramework.Maps.OSMap.IMap,
            drawingTools: OSFramework.Maps.DrawingTools.IDrawingTools,
            drawingToolsId: string,
            type: string,
            // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
            configs: any
        ) {
            super(map, drawingTools, drawingToolsId, type, configs);
            this.internalOptions = {};
            //We want to create internalOptions as an empty Object,
            //since on the first iteration we want the tool to be built even when configs are empty
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        private _addCompletedEventHandler(event: any): void {
            const uniqueId = OSFramework.Maps.Helper.GenerateUniqueId();
            // create the shape/marker element
            this.newElm = this.createElement(
                uniqueId,
                event.layer,
                // Get the configs to create the shape/marker (elementConfig)
                this.config
            );
            this.drawingTools.createdElements.push(this.newElm);

            const location = this.getLocation();
            const coordinates = this.getCoordinates();

            // Trigger the event of element complete (markercomplete, polylinecomplete, polygoncomplete, etc) with the information of a new element (boolean set to True)
            this.triggerOnDrawingChangeEvent(
                uniqueId,
                true,
                coordinates,
                location
            );
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
                OSFramework.Maps.Event.DrawingTools.DrawingToolsEventType
                    .ProviderEvent,
                // EventName
                this.completedToolEventName,
                // Extra (marker uniqueId and flag indicating that the element is new)
                { uniqueId, isNewElement, coordinates, location }
            );
        }

        // Adds the completedElement (completemarker, completepolyline, etc.) event listeners to the correspondent element.
        // The new handlers will create the shape/markers elements and remove the overlay created by the drawing tool on the map
        public addCompletedEvent(event: any): void {
            this._addCompletedEventHandler(event);
        }

        public build(): void {
            super.build();

            this.options = this.getProviderConfig();

            this.finishBuild();
        }

        public dispose(): void {
            super.dispose();
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        public abstract get options(): any;
        protected abstract get completedToolEventName(): string;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
        protected abstract set options(options: any);

        /**
         * Creates a new element based on the new element provider that results from the marker or shape complete events.
         *
         * @param uniqueId uniqueId of the new element
         * @param element new element provider (shape or marker). The new element results from the marker or shape complete events
         * @param configs configs to create the new element (on the osframework)
         */
        protected abstract createElement(
            uniqueId: string,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
            element: any,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
            configs: any
        ): void;

        protected abstract getCoordinates(): string;
        protected abstract getLocation(): string | string[];
    }
}
