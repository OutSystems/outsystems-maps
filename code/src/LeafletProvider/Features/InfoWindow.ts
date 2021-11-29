// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace LeafletProvider.Feature {
    export class InfoWindow
        implements
            OSFramework.Feature.IInfoWindow,
            OSFramework.Interface.IBuilder
    {
        private _infoWindow: L.Popup;
        private _map: OSMap.IMapLeaflet;
        private _popupIsOpened: boolean;

        constructor(map: OSMap.IMapLeaflet) {
            this._map = map;
        }

        // This method is a way of getting the options which include the offset.
        // The offset needs to be acquired dynamically as it should changes according to the height of the icon applied to the marker.
        private _getOptions(
            marker: OSFramework.Marker.IMarkerPopup
        ): L.PopupOptions {
            // Let's use the offsetHeight of the marker to get the height of the element and then subtract it with an offset
            // This will allow having a better offset (dynamically) depending on the size of the image applied as the marker icon
            const offsetHeight = marker.provider.getElement().offsetHeight;
            return {
                offset: [0, -offsetHeight]
            };
        }

        public build(): void {
            // Creates an instance of the infoWindow object from leaflet api
            // This content will be updated whenever a marker with popup is clicked
            this._infoWindow = new L.Popup();
            this._popupIsOpened = false;
        }

        public closePopup(marker: OSFramework.Marker.IMarkerPopup): void {
            if (this._popupIsOpened) {
                marker.provider.closePopup();
                // Let's make sure the popup gets unlinked from the Marker
                marker.provider.unbindPopup();
                this._popupIsOpened = false;
            }
        }

        public openPopup(marker: OSFramework.Marker.IMarkerPopup): void {
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
            marker: OSFramework.Marker.IMarkerPopup
        ): void {
            this._infoWindow.setContent(content);
            this._infoWindow.update();
            marker.provider.setPopupContent(this._infoWindow.getContent());
        }
    }
}
