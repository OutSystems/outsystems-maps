/// <reference path="../../OSFramework/FileLayer/AbstractFileLayer.ts" />

// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace GoogleProvider.FileLayer {
    export class FileLayer extends OSFramework.FileLayer.AbstractFileLayer<
        google.maps.KmlLayer,
        OSFramework.Configuration.IConfigurationFileLayer
    > {
        protected _provider: google.maps.KmlLayer;
        constructor(
            map: OSFramework.OSMap.IMap,
            FileLayerId: string,
            // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
            configs: any
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
                    OSFramework.Event.FileLayer.FileLayersEventType.OnClick
                ) &&
                this.provider.get('clickable') // Always true. Fallback in case this parameter gets changed in the future.
            ) {
                this.provider.addListener('click', () => {
                    this.fileLayerEvents.trigger(
                        OSFramework.Event.FileLayer.FileLayersEventType.OnClick
                    );
                });
            }
        }

        public get providerEvents(): Array<string> {
            return Constants.FileLayer.Events;
        }

        public build(): void {
            super.build();

            const configs: OSFramework.Configuration.IConfigurationFileLayer = this.getProviderConfig();

            this._provider = new google.maps.KmlLayer({
                ...configs,
                map: this.map.provider
            });

            this._setFileLayerEvents();

            this.finishBuild();
        }

        // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
        public changeProperty(propertyName: string, value: any): void {
            const propValue =
                OSFramework.Enum.OS_Config_FileLayer[propertyName];
            super.changeProperty(propertyName, value);
            if (this.isReady) {
                switch (propValue) {
                    case OSFramework.Enum.OS_Config_FileLayer.layerUrl:
                        return this.provider.setOptions({
                            url: value
                        });
                    case OSFramework.Enum.OS_Config_FileLayer.preserveViewport:
                        return this.provider.setOptions({
                            preserveViewport: value
                        });
                    case OSFramework.Enum.OS_Config_FileLayer.suppressPopups:
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
