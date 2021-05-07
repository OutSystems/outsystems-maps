/// <reference path="../../OSFramework/Marker/AbstractMarker.ts" />

// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace GoogleProvider.Marker {
    export class Marker
        extends OSFramework.Marker.AbstractMarker<
            google.maps.Marker,
            OSFramework.Configuration.Marker.GoogleMarkerConfig
        >
        implements IMarkerGoogle {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        private _advancedFormatObj: any;
        private _listeners: Array<string>;

        constructor(
            map: OSFramework.OSMap.IMap,
            markerId: string,
            // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
            configs: any
        ) {
            super(
                map,
                markerId,
                new OSFramework.Configuration.Marker.GoogleMarkerConfig(configs)
            );
        }

        private _setMarkerEvents(events: Array<string>) {
            if (this._listeners === undefined) this._listeners = [];
            // Make sure the listeners get removed before adding the new ones
            this._listeners.forEach((eventListener, index) => {
                google.maps.event.clearListeners(this.provider, eventListener);
                this._listeners.splice(index, 1);
            });

            // OnClick Event
            if (
                this.markerEvents.hasHandlers(
                    OSFramework.Event.Marker.MarkerEventType.OnClick
                )
            ) {
                this._provider.addListener('click', () => {
                    this.markerEvents.trigger(
                        OSFramework.Event.Marker.MarkerEventType.OnClick
                    );
                });
            }
            // OnMouseOver Event
            if (
                this.markerEvents.hasHandlers(
                    OSFramework.Event.Marker.MarkerEventType.OnMouseover
                )
            ) {
                this._provider.addListener('mouseover', () => {
                    this.markerEvents.trigger(
                        OSFramework.Event.Marker.MarkerEventType.OnMouseover
                    );
                });
            }
            // OnMouseOut Event
            if (
                this.markerEvents.hasHandlers(
                    OSFramework.Event.Marker.MarkerEventType.OnMouseout
                )
            ) {
                this._provider.addListener('mouseout', () => {
                    this.markerEvents.trigger(
                        OSFramework.Event.Marker.MarkerEventType.OnMouseout
                    );
                });
            }
            // OnEventTriggered Event (other events that can be set on the advancedFormat of the Marker)
            if (
                this.markerEvents.hasHandlers(
                    OSFramework.Event.Marker.MarkerEventType.OnEventTriggered
                ) &&
                events !== undefined
            ) {
                events.forEach((eventName: string) => {
                    this._provider.addListener(eventName, () => {
                        this._listeners.push(eventName);
                        this.markerEvents.trigger(
                            OSFramework.Event.Marker.MarkerEventType
                                .OnEventTriggered,
                            eventName
                        );
                    });
                });
            }
        }

        public build(): void {
            super.build();

            const markerOptions: google.maps.MarkerOptions = {};
            if (
                typeof this.config.iconUrl !== 'undefined' &&
                this.config.iconUrl !== ''
            ) {
                markerOptions.icon = this.config.iconUrl;
            }

            // Take care of the advancedFormat options which can override the previous configuration
            this._advancedFormatObj = OSFramework.Helper.JsonFormatter(
                this.config.advancedFormat
            );
            for (const property in this._advancedFormatObj) {
                const value = this._advancedFormatObj[property];
                this.config[property] = value;
                markerOptions[property] = value;
            }

            if (
                typeof this.config.location !== 'undefined' &&
                this.config.location !== ''
            ) {
                Helper.Conversions.ConvertToCoordinates(
                    this.config.location,
                    this.map.config.apiKey
                ).then((response) => {
                    markerOptions.position = {
                        lat: response.lat,
                        lng: response.lng
                    };
                    markerOptions.map = this.map.provider;
                    this._provider = new google.maps.Marker(markerOptions);

                    // We can only set the events on the provider after its creation
                    this._setMarkerEvents(this._advancedFormatObj.markerEvents);
                });
            } else {
                throw new Error('Invalid location');
            }
        }

        // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
        public changeProperty(propertyName: string, value: any): void {
            const propValue = OSFramework.Enum.OS_Config_Marker[propertyName];

            switch (propValue) {
                case OSFramework.Enum.OS_Config_Marker.location:
                    Helper.Conversions.ConvertToCoordinates(
                        value,
                        this.map.config.apiKey
                    ).then((response) => {
                        this._provider.setPosition({
                            lat: response.lat,
                            lng: response.lng
                        });
                    });
                    return;
                case OSFramework.Enum.OS_Config_Map.advancedFormat:
                    value = OSFramework.Helper.JsonFormatter(value);
                    // Make sure the MapEvents that are associated in the advancedFormat get updated
                    this._setMarkerEvents(value.markerEvents);
                    return this._provider.setOptions(value);
                case OSFramework.Enum.OS_Config_Marker.iconURL:
                    return this._provider.setIcon(value);

                default:
                    throw Error(
                        `changeProperty - Property '${propertyName}' can't be changed.`
                    );
            }
        }

        public dispose(): void {
            super.dispose();

            this._provider.setMap(null);
            this._provider = undefined;
        }

        /** Checks if the column has associated events */
        public get hasEvents(): boolean {
            return this.markerEvents !== undefined;
        }
    }
}
