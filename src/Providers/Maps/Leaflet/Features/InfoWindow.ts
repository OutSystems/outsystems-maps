// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace Provider.Leaflet.Feature {
    export class InfoWindow
        implements
            OSFramework.Maps.Feature.IInfoWindow,
            OSFramework.Maps.Interface.IBuilder
    {
        private _infoWindow: L.Popup;
        private _map: OSMap.IMapLeaflet;
        private _popupIsOpened: boolean;

        constructor(map: OSMap.IMapLeaflet) {
            this._map = map;
        }

        // This method is a way of getting the options which include the offset.
        // The offset needs to be acquired dynamically as it should change according to the height of the icon applied to the marker.
        private _getOptions(
            marker: OSFramework.Maps.Marker.IMarkerPopup
        ): L.PopupOptions {
            // Let's use the height of the marker icon as the offsetY. But if the height of the icon is not defined: use the runtime offsetHeight of the marker element
            const offsetHeight =
                marker.config.iconHeight > 0
                    ? marker.config.iconHeight
                    : marker.provider.getElement().offsetHeight;

            const options: L.PopupOptions = {
                // Don't use any offsetX to get it centered horizontally
                offset: [0, -offsetHeight]
            };

            return options;
        }

        public build(): void {
            // Creates an instance of the infoWindow object from leaflet api
            // This content will be updated whenever a marker with popup is clicked
            this._infoWindow = new L.Popup();
            this._popupIsOpened = false;
        }

        public closePopup(marker: OSFramework.Maps.Marker.IMarkerPopup): void {
            if (this._popupIsOpened) {
                marker.provider.closePopup();
                // Let's make sure the popup gets unlinked from the Marker
                marker.provider.unbindPopup();
                this._popupIsOpened = false;
            }
        }

        public openPopup(marker: OSFramework.Maps.Marker.IMarkerPopup): void {
            if (this._popupIsOpened === true) {
                this.closePopup(marker);
            }

            marker.provider
                .bindPopup(
                    this._infoWindow.getContent(),
                    this._getOptions(marker)
                )
                .openPopup();
            this._popupIsOpened = true;
        }

        public setPopupContent(
            content: string,
            marker: OSFramework.Maps.Marker.IMarkerPopup
        ): void {
            this._infoWindow.setContent(content);
            this._infoWindow.update();
            marker.provider.setPopupContent(this._infoWindow.getContent());
        }
    }
}
