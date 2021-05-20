/// <reference path="../../OSFramework/OSMap/AbstractMap.ts" />

// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace GoogleProvider.Map {
    export class StaticMap
        extends OSFramework.OSMap.AbstractMap<
            google.maps.Map,
            Configuration.OSMap.GoogleStaticMapConfig
        >
        implements IMapGoogle {
        // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
        constructor(mapId: string, configs: any) {
            super(
                mapId,
                new Configuration.OSMap.GoogleStaticMapConfig(configs)
            );
        }

        private _getCenter() {
            let position = this.config.center;
            if (this.markers.length >= 1) {
                position = this.markers[0].config.location;
            } else if (this.markers.length === 1) {
                position = this.markers[0].config.location;
            } else if (
                this.markers.length >= 2 &&
                this.config.zoom === OSFramework.Enum.OSMap.Zoom.Auto
            ) {
                position = this.markers[0].config.location;
            }
            return position;
        }

        private _getZoom() {
            if (this.config.zoom === OSFramework.Enum.OSMap.Zoom.Auto) {
                if (this.markers.length > 0) {
                    // If zoom is set to Auto, we son't need to set the zoom
                    return '';
                } else {
                    return '&zoom=' + OSFramework.Enum.OSMap.Zoom.Zoom8;
                }
            } else {
                return '&zoom=' + this.config.zoom;
            }
        }

        /**
         * Change the source of the image with the new url from GoogleAPI
         */
        private _renderImage(): void {
            const container = OSFramework.Helper.GetElementByUniqueId(
                this.uniqueId
            );
            const image = container.querySelector(
                '.StaticMapImage'
            ) as HTMLImageElement;

            const position = this._getCenter();
            const zoom = this._getZoom();
            const markers = this.markers.reduce((acc, curr) => {
                acc += '&markers=' + encodeURIComponent(curr.config.location);
                return acc;
            }, '');

            image.src =
                /* eslint-disable prettier/prettier */
                OSFramework.Helper.Constants.googleMapsApiURL + '/staticmap?' +
                'key=' + this.config.apiKey +
                '&center=' + encodeURIComponent(position) +
                /*'&markers=' +*/ markers +
                '&maptype=' + this.config.type +
                /*'&maptype=' +*/ zoom +
                '&scale=' + 1 + 
                '&size=' + container.offsetWidth +
                'x' + OSFramework.Helper.GetElementByWidgetId(this.widgetId).style.getPropertyValue('--map-height').replace('px', '');
                /* eslint-enable prettier/prettier */
            image.onerror = () => {
                MapAPI.MapManager.GetActiveMap().mapEvents.trigger(
                    OSFramework.Event.OSMap.MapEventType.OnError,
                    OSFramework.Enum.Errors.InvalidApiKey
                );
                // Invalid API key?
                image.alt = 'Image could not be loaded.';
            };
        }

        public addMarker(
            marker: OSFramework.Marker.IMarker
        ): OSFramework.Marker.IMarker {
            super.addMarker(marker);

            return marker;
        }

        public build(): void {
            super.build();
            this._renderImage();
        }

        // ChangeMarkerProperty method can't be used on a StaticMap
        public changeMarkerProperty(
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            markerId: string,
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            propertyName: string,
            // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
            propertyValue: any
        ): void {
            throw new Error('Method not implemented.');
        }

        // ChangeProperty method can't be used on a StaticMap
        public changeProperty(
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            propertyName: string,
            // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
            propertyValue: any
        ): void {
            throw new Error('Method not implemented.');
        }

        public dispose(): void {
            super.dispose();
            // this._provider = undefined;
        }

        // Refresh method can't be used on a StaticMap
        public refresh(): void {
            throw new Error('Method not implemented.');
        }
    }
}
