/// <reference path="AbstractProviderShape.ts" />

// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace GoogleProvider.Shape {
    export abstract class AbstractPolyshape<
        T extends OSFramework.Configuration.IConfigurationShape,
        W extends google.maps.Polygon | google.maps.Polyline
    > extends AbstractProviderShape<T, W> {
        private _shapeChangedEventTimeout: number;

        protected _setProviderPath(
            path: Array<OSFramework.OSStructures.OSMap.Coordinates>
        ): void {
            this._provider.setPath(path);
        }

        protected _setShapeEvents(): void {
            super._setShapeEvents();

            // The following event handlers are really spefic as they only work if the event is applied to the shape path
            this.shapeEvents.handlers.forEach(
                (
                    handler: OSFramework.Event.IEvent<string>,
                    eventName: string
                ) => {
                    if (
                        handler instanceof
                        OSFramework.Event.Shape.ShapeProviderEvent
                    ) {
                        if (
                            eventName ===
                            OSFramework.Helper.Constants.shapeChangedEvent
                        ) {
                            this._listeners.push(eventName);
                            Constants.Shape.ProviderPolyshapeEvents.forEach(
                                (event) =>
                                    this.provider
                                        .getPath()
                                        .addListener(event, () => {
                                            if (
                                                this._shapeChangedEventTimeout
                                            ) {
                                                clearTimeout(
                                                    this
                                                        ._shapeChangedEventTimeout
                                                );
                                            }
                                            this._shapeChangedEventTimeout = setTimeout(
                                                () =>
                                                    this.shapeEvents.trigger(
                                                        // EventType
                                                        OSFramework.Event.Shape
                                                            .ShapeEventType
                                                            .ProviderEvent,
                                                        // EventName
                                                        OSFramework.Helper
                                                            .Constants
                                                            .shapeChangedEvent
                                                    ),
                                                500
                                            );
                                        })
                            );
                        } else if (
                            // If the eventName is included inside the ProviderSpecialEvents then add the listener
                            Constants.Shape.ProviderPolyshapeEvents.indexOf(
                                eventName
                            ) !== -1
                        ) {
                            this.provider
                                .getPath()
                                .addListener(eventName, () => {
                                    this.shapeEvents.trigger(
                                        // EventType
                                        OSFramework.Event.Shape.ShapeEventType
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
            const propValue = OSFramework.Enum.OS_Config_Shape[propertyName];
            super.changeProperty(propertyName, value);
            if (this.isReady) {
                switch (propValue) {
                    case OSFramework.Enum.OS_Config_Shape.fillColor:
                    case OSFramework.Enum.OS_Config_Shape.fillOpacity:
                        return this.provider.set(propertyName, value);
                    default:
                        super.changeProperty(propertyName, value);
                }
            }
        }

        public abstract get invalidShapeLocationErrorCode(): OSFramework.Enum.ErrorCodes;

        public abstract get shapeTag(): string;

        protected abstract _createProvider(
            locations:
                | Array<OSFramework.OSStructures.OSMap.Coordinates>
                | OSFramework.OSStructures.OSMap.Coordinates
        ): W;
    }
}
