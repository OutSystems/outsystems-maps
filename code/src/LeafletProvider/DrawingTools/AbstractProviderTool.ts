/// <reference path="../../OSFramework/DrawingTools/AbstractTool.ts" />

// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace LeafletProvider.DrawingTools {
    export abstract class AbstractProviderTool<
        T extends OSFramework.Configuration.IConfigurationTool
    > extends OSFramework.DrawingTools.AbstractTool<T> {
        constructor(
            map: OSFramework.OSMap.IMap,
            drawingTools: OSFramework.DrawingTools.IDrawingTools,
            drawingToolsId: string,
            type: string,
            // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
            configs: any
        ) {
            super(map, drawingTools, drawingToolsId, type, configs);
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        private _addCompletedEventHandler(element: any): void {
            const uniqueId = OSFramework.Helper.GenerateUniqueId();
            // create the shape/marker element
            const newElm = this.createElement(
                uniqueId,
                element,
                // Get the configs to create the shape/marker (elementConfig)
                this.config
            );
            this.drawingTools.createdElements.push(newElm);

            // Trigger the event of element complete (markercomplete, polylinecomplete, polygoncomplete, etc) with the information of a new element (boolean set to True)
            this.triggerOnDrawingChangeEvent(uniqueId, true);

            // Make sure to remove the overlays after creating them,
            // Otherwise the following line which will create the shape/marker will be over the overlay of the provider
            element.setMap(null); // unset the map to remove the overlay
            element = null;
        }

        /**
         * Trigger the event OnDrawingChange from the Tool. This event will be triggered by an onComplete or an onChange event on the elemet
         *
         * @param uniqueId uniqueId of the element from which we want to trigger the event
         * @param isNewElement boolean that indicates if the element is new or not (oncomplete x onchange)
         */
        protected triggerOnDrawingChangeEvent(
            uniqueId: string,
            isNewElement: boolean
        ): void {
            this.drawingTools.drawingToolsEvents.trigger(
                // EventType
                OSFramework.Event.DrawingTools.DrawingToolsEventType
                    .ProviderEvent,
                // EventName
                this.completedToolEventName,
                // Extra (marker uniqueId and flag indicating that the element is new)
                { uniqueId, isNewElement }
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

        // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
        public changeProperty(propertyName: string, value: any): void {
            const propValue = OSFramework.Enum.OS_Config_Shape[propertyName];
            super.changeProperty(propertyName, value);
            if (this.drawingTools.isReady) {
                switch (propValue) {
                    case OSFramework.Enum.OS_Config_Shape.allowDrag:
                        this.options = { draggable: value };
                        return;
                }
            }
        }

        public dispose(): void {
            super.dispose();
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        protected abstract get options(): any;
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
    }
}
