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
            // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
            ...args: any
        ): void {
            // Check if the FileLayer has any events associated
            if (this.handlers.has(eventType)) {
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
                            this._fileLayer.widgetId ||
                                this._fileLayer.uniqueId, // Id of Shape block that was clicked
                            args[0].coordinates, // LatLng from the click event
                            args[0].featureData // FeatureData from the FileLayer that was clicked
                        );
                        break;
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
