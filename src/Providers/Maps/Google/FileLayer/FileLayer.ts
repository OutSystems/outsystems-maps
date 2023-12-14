/// <reference path="../../../../OSFramework/Maps/FileLayer/AbstractFileLayer.ts" />

// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace Provider.Maps.Google.FileLayer {
    export class FileLayer extends OSFramework.Maps.FileLayer.AbstractFileLayer<
        google.maps.KmlLayer,
        OSFramework.Maps.Configuration.IConfigurationFileLayer
    > {
        constructor(
            map: OSFramework.Maps.OSMap.IMap,
            FileLayerId: string,
            configs: JSON
        ) {
            super(
                map,
                FileLayerId,
                new Configuration.FileLayer.FileLayerConfig(configs)
            );
        }

        private _setFileLayerEvents(): void {
            // Make sure the listeners get removed before adding the new ones
            google.maps.event.clearInstanceListeners(this.provider);

            // OnClick Event
            if (
                this.fileLayerEvents.hasHandlers(
                    OSFramework.Maps.Event.FileLayer.FileLayersEventType.OnClick
                ) &&
                this.provider.get('clickable') // Always true. Fallback in case this parameter gets changed in the future.
            ) {
                this.provider.addListener(
                    'click',
                    (event: google.maps.KmlMouseEvent) => {
                        const flParams: OSFramework.Maps.FileLayer.IFileLayerEventParams =
                            {
                                // Coordinates from the event that was triggered (by the click)
                                coordinates: JSON.stringify({
                                    Lat: event.latLng.lat(),
                                    Lng: event.latLng.lng()
                                }),
                                // GoogleMaps description for featureData:
                                //  -> Data for a single KML feature in JSON format, returned when a KML feature is clicked.
                                //  -> The data contained in this object mirrors that associated with the feature in the KML or GeoRSS markup in which it is declared.
                                // We need this data stringified in order to return it to the handler
                                featureData: JSON.stringify(
                                    event.featureData as google.maps.KmlFeatureData
                                )
                            };
                        this.fileLayerEvents.trigger(
                            OSFramework.Maps.Event.FileLayer.FileLayersEventType
                                .OnClick,
                            undefined,
                            // Extra parameters to be passed as arguments on the callback of the OnClick event handler
                            flParams
                        );
                    }
                );
            }
        }

        public build(): void {
            super.build();

            // Creates the provider KMLLayer
            this._provider = new google.maps.KmlLayer({
                ...this.getProviderConfig(),
                map: this.map.provider
            });

            // Set the FileLayerEvents (includes the onClick event listener)
            this._setFileLayerEvents();

            this.finishBuild();
        }

        // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
        public changeProperty(propertyName: string, value: any): void {
            const propValue =
                OSFramework.Maps.Enum.OS_Config_FileLayer[propertyName];
            super.changeProperty(propertyName, value);
            if (this.isReady) {
                switch (propValue) {
                    case OSFramework.Maps.Enum.OS_Config_FileLayer.layerUrl:
                        return this.provider.setOptions({
                            url: value
                        });
                    case OSFramework.Maps.Enum.OS_Config_FileLayer
                        .preserveViewport:
                        return this.provider.setOptions({
                            preserveViewport: value
                        });
                    case OSFramework.Maps.Enum.OS_Config_FileLayer
                        .suppressPopups:
                        return this.provider.setOptions({
                            suppressInfoWindows: value
                        });
                }
            }
        }

        public dispose(): void {
            if (this.isReady) {
                this.provider.set('map', null);
            }
            this._provider = undefined;
            super.dispose();
        }

        public refreshProviderEvents(): void {
            if (this.isReady) this._setFileLayerEvents();
        }
    }
}
