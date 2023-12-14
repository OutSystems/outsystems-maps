/// <reference path="../../../../OSFramework/Maps/OSMap/AbstractMap.ts" />

// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace Provider.Maps.Google.OSMap {
    type Size = {
        height: number;
        width: number;
    };

    export class StaticMap
        extends OSFramework.Maps.OSMap.AbstractMap<
            google.maps.Map,
            Configuration.OSMap.GoogleStaticMapConfig
        >
        implements IMapGoogle
    {
        private _center: string;
        private _markerString: string;
        private _size: Size;
        private _type: OSFramework.Maps.Enum.OSMap.Type;
        private _zoom: number;
        constructor(mapId: string, configs: JSON) {
            super(
                mapId,
                OSFramework.Maps.Enum.ProviderType.Google,
                new Configuration.OSMap.GoogleStaticMapConfig(configs),
                OSFramework.Maps.Enum.MapType.StaticMap
            );
        }

        private _getCenter(center?: string): string {
            // If the center paramater is undefined, then use the config.center
            let position =
                center === undefined ? (this.config.center as string) : center;
            // If has markers use the first one's config location as the new position
            if (this.markers.length >= 1) {
                position = this.markers[0].config.location;
            }
            return position;
        }

        private _getMarkers(): string {
            return this.markers.reduce((acc, curr) => {
                if (curr.config.iconUrl !== '') {
                    acc +=
                        '&markers=icon:' +
                        encodeURIComponent(curr.config.iconUrl) +
                        '%7C' +
                        encodeURIComponent(
                            curr.config.location.replace(
                                /[^.,\-a-zA-Z0-9 ]/g,
                                ''
                            )
                        );
                } else {
                    acc +=
                        '&markers=' +
                        encodeURIComponent(
                            curr.config.location.replace(
                                /[^.,\-a-zA-Z0-9 ]/g,
                                ''
                            )
                        );
                }
                return acc;
            }, '');
        }

        private _getSize(): Size {
            const container = OSFramework.Maps.Helper.GetElementByUniqueId(
                this.uniqueId
            );
            const width = container.offsetWidth;
            const height = container.offsetHeight;
            // We are using Scale = 2 (better resolution), so we need to divide the width and height by 2 as well
            return {
                width: Math.round(width / 2),
                height: Math.round(height / 2)
            };
        }

        private _getZoom(level?: number): number {
            // If level is undefined, use the config zoom as the default
            if (level === undefined) level = this.config.zoom;

            if (level === OSFramework.Maps.Enum.OSMap.Zoom.Auto) {
                if (this.markers.length > 0) {
                    // If zoom is set to Auto, we don't need to set the zoom so let's use -1 to help rendering the image
                    return -1;
                } else {
                    return OSFramework.Maps.Enum.OSMap.Zoom.Zoom8;
                }
            } else {
                return level;
            }
        }

        /**
         * Change the source of the image with the new url from GoogleAPI
         */
        private _renderImage(): void {
            const container = OSFramework.Maps.Helper.GetElementByUniqueId(
                this.uniqueId
            );
            const image = container.querySelector(
                OSFramework.Maps.Helper.Constants.staticMapCss
            ) as HTMLImageElement;

            image.src =
                /* eslint-disable prettier/prettier */
                `${OSFramework.Maps.Helper.Constants.googleMapsApiStaticMap}?` +
                'key=' +
                this.config.apiKey +
                '&center=' +
                this._center +
                /*'&markers=' +*/ this._markerString +
                '&maptype=' +
                this._type +
                // If the zoom = -1, then don't use the zoom parameter
                (this._zoom > -1 ? '&zoom=' + this._zoom : '') +
                // Scale 2 will give the Map a better resolution
                '&scale=' +
                2 +
                '&size=' +
                this._size.width +
                'x' +
                this._size.height;
            image.onerror = () => {
                // Check if needed
                this.mapEvents.trigger(
                    OSFramework.Maps.Event.OSMap.MapEventType.OnError,
                    this,
                    OSFramework.Maps.Enum.ErrorCodes.LIB_InvalidApiKeyStaticMap
                );
                // Invalid API key
                image.alt = 'Image could not be loaded due to invalid APIKey.';
            };
        }

        public get mapTag(): string {
            return OSFramework.Maps.Helper.Constants.staticMapTag;
        }

        public get addedEvents(): Array<string> {
            throw new Error('StaticMap provider has no events');
        }

        public addMarker(
            marker: OSFramework.Maps.Marker.IMarker
        ): OSFramework.Maps.Marker.IMarker {
            if (this.isReady) {
                this.mapEvents.trigger(
                    OSFramework.Maps.Event.OSMap.MapEventType.OnError,
                    this,
                    OSFramework.Maps.Enum.ErrorCodes
                        .CFG_CantChangeParamsStaticMap
                );
                return;
            }
            super.addMarker(marker);

            return marker;
        }

        public build(): void {
            super.build();

            this._center = this._getCenter();
            this._zoom = this._getZoom();
            this._markerString = this._getMarkers();
            this._size = this._getSize();
            this._type = this.config.type;

            this._renderImage();
            this.finishBuild();
        }

        // ChangeMarkerProperty method can't be used on a StaticMap
        public changeDrawingToolsProperty(
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            drawingToolsId: string,
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            propertyName: string,
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            propertyValue: unknown
        ): void {
            this.mapEvents.trigger(
                OSFramework.Maps.Event.OSMap.MapEventType.OnError,
                this,
                OSFramework.Maps.Enum.ErrorCodes.CFG_CantChangeParamsStaticMap
            );
            return;
        }

        // ChangeFileLayerProperty method can't be used on a StaticMap
        public changeFileLayerProperty(
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            fileLayerId: string,
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            propertyName: string,
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            propertyValue: unknown
        ): void {
            this.mapEvents.trigger(
                OSFramework.Maps.Event.OSMap.MapEventType.OnError,
                this,
                OSFramework.Maps.Enum.ErrorCodes.CFG_CantChangeParamsStaticMap
            );
            return;
        }

        // ChangeHeatmapLayerProperty method can't be used on a StaticMap
        public changeHeatmapLayerProperty(
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            heatmapLayerId: string,
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            propertyName: string,
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            propertyValue: unknown
        ): void {
            this.mapEvents.trigger(
                OSFramework.Maps.Event.OSMap.MapEventType.OnError,
                this,
                OSFramework.Maps.Enum.ErrorCodes.CFG_CantChangeParamsStaticMap
            );
            return;
        }

        // ChangeMarkerProperty method can't be used on a StaticMap
        public changeMarkerProperty(
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            markerId: string,
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            propertyName: string,
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            propertyValue: unknown
        ): void {
            this.mapEvents.trigger(
                OSFramework.Maps.Event.OSMap.MapEventType.OnError,
                this,
                OSFramework.Maps.Enum.ErrorCodes.CFG_CantChangeParamsStaticMap
            );
            return;
        }

        // ChangeProperty method can't be used on a StaticMap
        public changeProperty(
            propertyName: string,
            propertyValue: unknown
        ): void {
            // If the StaticMap is already rendered then throw an error
            if (this.isReady) {
                this.mapEvents.trigger(
                    OSFramework.Maps.Event.OSMap.MapEventType.OnError,
                    this,
                    OSFramework.Maps.Enum.ErrorCodes
                        .CFG_CantChangeParamsStaticMap
                );
                return;
            }

            const propValue =
                OSFramework.Maps.Enum.OS_Config_StaticMap[propertyName];

            switch (propValue) {
                case OSFramework.Maps.Enum.OS_Config_StaticMap.apiKey:
                    if (this.config.apiKey !== '') {
                        this.mapEvents.trigger(
                            OSFramework.Maps.Event.OSMap.MapEventType.OnError,
                            this,
                            OSFramework.Maps.Enum.ErrorCodes
                                .CFG_APIKeyAlreadySetStaticMap
                        );
                    }
                    return super.changeProperty(propertyName, propertyValue);
                case OSFramework.Maps.Enum.OS_Config_StaticMap.center:
                    this._center = this._getCenter(propertyValue as string);
                    return;
                case OSFramework.Maps.Enum.OS_Config_StaticMap.zoom:
                    this._zoom = this._getZoom(propertyValue as number);
                    return;
                case OSFramework.Maps.Enum.OS_Config_StaticMap.type:
                    this._type =
                        propertyValue as OSFramework.Maps.Enum.OSMap.Type;
                    return;
                default:
                    this.mapEvents.trigger(
                        OSFramework.Maps.Event.OSMap.MapEventType.OnError,
                        this,
                        OSFramework.Maps.Enum.ErrorCodes
                            .CFG_CantChangeParamsStaticMap
                    );
                    return;
            }
        }

        public changeShapeProperty(
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            shapeId: string,
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            propertyName: string,
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            propertyValue: unknown
        ): void {
            this.mapEvents.trigger(
                OSFramework.Maps.Event.OSMap.MapEventType.OnError,
                this,
                OSFramework.Maps.Enum.ErrorCodes.CFG_CantChangeParamsStaticMap
            );
            return;
        }

        public dispose(): void {
            super.dispose();
        }

        // Refresh method can't be used on a StaticMap
        public refresh(): void {
            throw new Error(`Refresh method can't be used on a StaticMap`);
        }

        // Refresh Provider Events method can't be used on a StaticMap because Static Maps don't have events.
        public refreshProviderEvents(): void {
            throw new Error(
                "Refresh Provider Events method can't be used on a StaticMap because Static Maps don't have events."
            );
        }

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        public validateProviderEvent(eventName: string): boolean {
            throw new Error('StaticMap provider has no supported events');
        }
    }
}
