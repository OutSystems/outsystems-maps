/// <reference path="AbstractProviderTool.ts" />

// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace Provider.Google.DrawingTools {
    export abstract class AbstractDrawShape<
        T extends Configuration.DrawingTools.DrawConfig
    > extends AbstractProviderTool<T> {
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

        /** Create the new shape element based on the configurations (already contains the locations, the bounds or the center and radius depending on the type of the new shape) */
        protected createShapeElement(
            uniqueId: string,
            type: OSFramework.Enum.ShapeType,
            // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
            configs: any
        ): OSFramework.Shape.IShape {
            const _shape = Shape.ShapeFactory.MakeShape(
                this.map,
                uniqueId,
                type,
                configs
            );

            // Add the onChange event to the new element
            this.setOnChangeEvent(_shape, _shape.config.locations);
            // Add the new element to the map
            this.map.addShape(_shape);

            return _shape;
        }

        /** Add the onChange event to the new element */
        protected setOnChangeEvent(
            _shape: OSFramework.Shape.IShape,
            locations: string
        ): void {
            _shape.shapeEvents.addHandler(
                // changing the shape locations or bounds is only available via the drag-and-drop and resize, so the solution passes by adding the shape_changed event listener as the shape's OnChanged event
                OSFramework.Helper.Constants
                    .shapeChangedEvent as OSFramework.Event.Shape.ShapeEventType,
                () => {
                    this.drawingTools.drawingToolsEvents.trigger(
                        // EventType
                        OSFramework.Event.DrawingTools.DrawingToolsEventType
                            .ProviderEvent,
                        // EventName
                        this.completedToolEventName,
                        // The extra parameters, uniqueId and isNewElement set to false indicating that the element is not new
                        {
                            uniqueId: _shape.uniqueId,
                            isNewElement: false,
                            locations
                        }
                    );
                }
            );
        }

        public build(): void {
            super.build();
        }

        // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
        public changeProperty(propertyName: string, value: any): void {
            const propValue = OSFramework.Enum.OS_Config_Shape[propertyName];
            super.changeProperty(propertyName, value);
            if (this.drawingTools.isReady) {
                switch (propValue) {
                    case OSFramework.Enum.OS_Config_Shape.allowEdit:
                        this.options = { editable: value };
                        return;
                    case OSFramework.Enum.OS_Config_Shape.strokeOpacity:
                        this.options = { strokeOpacity: value };
                        return;
                    case OSFramework.Enum.OS_Config_Shape.strokeColor:
                        this.options = { strokeColor: value };
                        return;
                    case OSFramework.Enum.OS_Config_Shape.strokeWeight:
                        this.options = { strokeWeight: value };
                        return;
                    // If the following configurations are not included on the configs of the tool, the AbstractTool will make sure to throw an error
                    case OSFramework.Enum.OS_Config_Shape.fillOpacity:
                        this.options = { fillOpacity: value };
                        return;
                    case OSFramework.Enum.OS_Config_Shape.fillColor:
                        this.options = { fillColor: value };
                        return;
                }
            }
        }
    }
}
