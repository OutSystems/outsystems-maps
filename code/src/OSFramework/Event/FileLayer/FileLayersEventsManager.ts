// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace OSFramework.Event.FileLayer {
    /**
     * Class that will be responsible for managing the events of the FileLayer.
     *
     * @export
     * @class FileLayerEventsManager
     * @extends {AbstractEventsManager<FileLayersEventType, string>}
     */
    export class FileLayersEventsManager extends AbstractEventsManager<
        FileLayersEventType,
        string
    > {
        private _fileLayer: OSFramework.FileLayer.IFileLayer;

        constructor(fileLayer: OSFramework.FileLayer.IFileLayer) {
            super();
            this._fileLayer = fileLayer;
        }

        protected getInstanceOfEventType(
            eventType: FileLayersEventType
        ): OSFramework.Event.IEvent<string> {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            let event: OSFramework.Event.IEvent<string>;

            switch (eventType) {
                case FileLayersEventType.Initialized:
                    event = new FileLayersInitializedEvent();
                    break;
                case FileLayersEventType.OnClick:
                    event = new FileLayersOnClickEvent();
                    break;
                default:
                    // Validate if google provider has this event before creating the instance of FileLayerProviderEvent
                    if (
                        this._fileLayer.validateProviderEvent(eventType) ===
                        true
                    ) {
                        event = new FileLayersProviderEvent();
                        break;
                    }
                    this._fileLayer.map.mapEvents.trigger(
                        OSMap.MapEventType.OnError,
                        this._fileLayer.map,
                        Enum.ErrorCodes.GEN_UnsupportedEventFileLayer,
                        `${eventType}`
                    );
                    return;
            }
            return event;
        }

        /**
         * Trigger the specific events depending on the event type specified
         * @param eventType Type of the event currently supported in the FileLayer element.
         * @param value Value to be passed to OS in the type of a string.
         */
        public trigger(
            eventType: FileLayersEventType,
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            eventInfo?: string,
            // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
            ...args: any
        ): void {
            // Let's first check if the FileLayer has any events associated
            // If the event type is ProviderEvent than we need to get the handlers for the eventInfo -> name of the event
            // If the event type is not ProviderEvent than we need to get the handlers for the eventType (Initialized, OnError, OnEventTriggered)
            const hasEvents =
                eventType === FileLayersEventType.ProviderEvent
                    ? this.handlers.has(eventInfo as FileLayersEventType)
                    : this.handlers.has(eventType);
            if (hasEvents) {
                const handlerEvent = this.handlers.get(eventType);

                switch (eventType) {
                    case FileLayersEventType.Initialized:
                        handlerEvent.trigger(
                            this._fileLayer.map.widgetId, // Id of Map block that was initialized
                            this._fileLayer.widgetId || this._fileLayer.uniqueId // Id of FileLayer block that was initialized
                        );
                        break;
                    case FileLayersEventType.OnClick:
                        handlerEvent.trigger(
                            this._fileLayer.map.widgetId, // Id of Map block that was clicked
                            this._fileLayer.widgetId || this._fileLayer.uniqueId // Id of Shape block that was clicked
                        );
                        break;
                    case FileLayersEventType.ProviderEvent:
                        // If the event type is ProviderEvent we need to first check if the event info (name of the event) is a valid one for the provider events
                        if (
                            this._fileLayer.validateProviderEvent(eventInfo) ===
                            true
                        ) {
                            const handler = this.handlers.get(
                                eventInfo as FileLayersEventType
                            );
                            handler.trigger(
                                this._fileLayer.map.widgetId, // Id of Map block that triggered the event
                                args[0].uniqueId ||
                                    this._fileLayer.widgetId ||
                                    this._fileLayer.uniqueId, // Id of marker/shape block (once created by the FileLayer) that triggered the event
                                // eventInfo, // Name of the event that got triggered
                                args[0].isNewElement // IsNewShape/IsNewMarker default is true
                            );
                            break;
                        }
                    // If the event is not valid we can fall in the default case of the switch and throw an error
                    // eslint-disable-next-line no-fallthrough
                    default:
                        this._fileLayer.map.mapEvents.trigger(
                            OSMap.MapEventType.OnError,
                            this._fileLayer.map,
                            Enum.ErrorCodes.GEN_UnsupportedEventFileLayer,
                            `${eventType}`
                        );
                        return;
                }
            }
        }
    }
}
