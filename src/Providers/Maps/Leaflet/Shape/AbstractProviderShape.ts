/// <reference path="../../../../OSFramework/Maps/Shape/AbstractShape.ts" />

// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace Provider.Maps.Leaflet.Shape {
    export abstract class AbstractProviderShape<
        T extends OSFramework.Maps.Configuration.IConfigurationShape,
        W extends L.Path
    > extends OSFramework.Maps.Shape.AbstractShape<W, T> {
        private _shapeChangedEventTimeout: number;

        /** Checks if the Shape has associated events */
        public get hasEvents(): boolean {
            return this.shapeEvents !== undefined;
        }

        public get shapeProviderEvents(): Array<string> {
            return Constants.Shape.Events;
        }

        private _resetShapeEvents(): void {
            // Make sure the listeners get removed before adding the new ones
            this._addedEvents.forEach((eventListener, index) => {
                this._addedEvents.splice(index, 1);
            });
        }

        /** Sets the dragging and editable configurations on the provider. We need to take care of both simultaneously because the disableEdit() method removes the dragging from the shape */
        private _setDragEditConfigs(
            allowDrag: boolean,
            allowEdit: boolean
        ): void {
            // Using any here because the enableEdit(), disableEdit() methods and dragging property are not available on the default L (leaflet) library and we need to exclusively use the mentioned methods
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const providerShape: any = this.provider;
            allowEdit
                ? providerShape.enableEdit()
                : providerShape.disableEdit();

            allowDrag
                ? providerShape.dragging.enable()
                : providerShape.dragging.disable();
        }

        private _triggerShapeChangedEvent(shape: any) {
            const shapeProperties = this.getShapeProperties();

            this.shapeEvents.trigger(
                // EventType
                OSFramework.Maps.Event.Shape.ShapeEventType.ProviderEvent,
                // EventName
                OSFramework.Maps.Helper.Constants.shapeChangedEvent,
                shapeProperties // retornar apenas location e radius etc
            );
        }

        /** Builds the provider (asynchronously) by receving a set of multiple coordinates (creating a path for the shape) or just one (creating the center of the shape) */
        protected buildProvider(
            coordinates:
                | Promise<OSFramework.Maps.OSStructures.OSMap.Coordinates>
                | Promise<
                      Array<OSFramework.Maps.OSStructures.OSMap.Coordinates>
                  >
                | Promise<OSFramework.Maps.OSStructures.OSMap.Bounds>
        ): void {
            // First build coords from locations
            // Then, create the provider (Leaflet maps Shape)
            // Finally, set Shape events

            // If coords is undefined (should be a promise) -> don't create the shape
            if (coordinates !== undefined) {
                coordinates
                    .then((coords) => {
                        // Create the provider with the respective coords
                        this._provider = this.createProvider(coords);
                        this._provider.addTo(this.map.provider);
                        // Set the drag and edition features on the shape
                        this._setDragEditConfigs(
                            this.config.allowDrag,
                            this.config.allowEdit
                        );
                        // We can only set the events on the provider after its creation
                        this.setShapeEvents();

                        // Finish build of Shape
                        this.finishBuild();
                    })
                    .catch((error) => {
                        OSFramework.Maps.Helper.ThrowError(
                            this.map,
                            OSFramework.Maps.Enum.ErrorCodes
                                .LIB_FailedGeocodingShapeLocations,
                            error
                        );
                    });
            }
        }

        protected setShapeEvents(): void {
            // Make sure the listeners get removed before adding the new ones
            this._resetShapeEvents();

            // OnClick Event
            if (
                this.shapeEvents.hasHandlers(
                    OSFramework.Maps.Event.Shape.ShapeEventType.OnClick
                )
            ) {
                this.provider.addEventListener('click', () => {
                    this.shapeEvents.trigger(
                        OSFramework.Maps.Event.Shape.ShapeEventType.OnClick
                    );
                });
            }

            // Any events that got added to the shapeEvents via the API Subscribe method will have to be taken care here
            // If the Event type of each handler is ShapeProviderEvent, we want to make sure to add that event to the listeners of the leaflet shape provider (e.g. dblclick, dragend, etc)
            this.shapeEvents.handlers.forEach(
                (
                    handler: OSFramework.Maps.Event.IEvent<string>,
                    eventName: string
                ) => {
                    if (
                        handler instanceof
                        OSFramework.Maps.Event.Shape.ShapeProviderEvent
                    ) {
                        // Take care of the shape_changed provider events
                        if (
                            eventName ===
                            OSFramework.Maps.Helper.Constants.shapeChangedEvent
                        ) {
                            this._addedEvents.push(eventName);
                            this.providerEventsList.forEach((event) =>
                                this.provider.addEventListener(
                                    event,
                                    (eventData: L.LeafletEvent) => {
                                        if (this._shapeChangedEventTimeout) {
                                            clearTimeout(
                                                this._shapeChangedEventTimeout
                                            );
                                        }
                                        this._shapeChangedEventTimeout =
                                            setTimeout(
                                                this._triggerShapeChangedEvent.bind(
                                                    this,
                                                    eventData.target
                                                ),
                                                500
                                            );
                                    }
                                )
                            );
                        } else if (
                            // If the eventName is included inside the ProviderSpecialEvents then add the listener
                            Constants.Shape.Events.indexOf(eventName) !== -1 ||
                            Constants.Shape.ProviderSpecialEvents.indexOf(
                                eventName
                            ) !== -1
                        ) {
                            // Take care of the custom provider events
                            this._addedEvents.push(eventName);
                            this.provider.addEventListener(eventName, () => {
                                this.shapeEvents.trigger(
                                    // EventType
                                    OSFramework.Maps.Event.Shape.ShapeEventType
                                        .ProviderEvent,
                                    // EventName
                                    eventName
                                );
                            });
                        }
                    }
                }
            );
        }

        // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
        public changeProperty(propertyName: string, value: any): void {
            const propValue =
                OSFramework.Maps.Enum.OS_Config_Shape[propertyName];
            super.changeProperty(propertyName, value);
            if (this.isReady) {
                switch (propValue) {
                    case OSFramework.Maps.Enum.OS_Config_Shape.allowDrag:
                        this._setDragEditConfigs(value, this.config.allowEdit);
                        return;
                    case OSFramework.Maps.Enum.OS_Config_Shape.allowEdit:
                        this._setDragEditConfigs(this.config.allowDrag, value);
                        return;
                    case OSFramework.Maps.Enum.OS_Config_Shape.strokeOpacity:
                        this.provider.setStyle({ opacity: value });
                        return;
                    case OSFramework.Maps.Enum.OS_Config_Shape.strokeColor:
                        this.provider.setStyle({ color: value });
                        return;
                    case OSFramework.Maps.Enum.OS_Config_Shape.strokeWeight:
                        this.provider.setStyle({ weight: value });
                        return;
                }
            }
        }

        public dispose(): void {
            if (this.isReady) {
                this._provider.remove();
            }
            this._provider = undefined;
            super.dispose();
        }

        public refreshProviderEvents(): void {
            if (this.isReady) this.setShapeEvents();
        }

        protected abstract createProvider(
            locations:
                | Array<OSFramework.Maps.OSStructures.OSMap.Coordinates>
                | OSFramework.Maps.OSStructures.OSMap.Coordinates
                | OSFramework.Maps.OSStructures.OSMap.Bounds
        ): W;

        public abstract get providerEventsList(): Array<string>;
        public abstract get shapeTag(): string;
        protected abstract getShapeProperties(): any;
    }
}
