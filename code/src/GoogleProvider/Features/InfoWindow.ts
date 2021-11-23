// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace GoogleProvider.Feature {
    export class InfoWindow
        implements
            OSFramework.Feature.IInfoWindow,
            OSFramework.Interface.IBuilder {
        private _infoWindow: google.maps.InfoWindow;
        private _map: OSMap.IMapGoogle;
        private _popupIsOpened: boolean;

        constructor(map: OSMap.IMapGoogle) {
            this._map = map;
        }

        // eslint-disable-next-line @typescript-eslint/no-empty-function
        public build(): void {
            // Creates an instance of the infoWindow object from google maps api
            // We need to specify the content, so let's make it an empty string
            // This content will be updated whenever a marker with popup is clicked
            this._infoWindow = new google.maps.InfoWindow({
                content: ''
            });
            this._popupIsOpened = false;

            // Close the popup on closeClick or ESC key.
            this._infoWindow.addListener(
                'closeclick',
                this.closePopup.bind(this)
            );
        }

        public closePopup(): void {
            if (this._popupIsOpened) {
                this._infoWindow.close();
                this._popupIsOpened = false;
            }
        }

        public openPopup(marker: OSFramework.Marker.IMarkerPopup): void {
            if (this._popupIsOpened === true) {
                this.closePopup();
            }
            this._infoWindow.open(this._map.provider, marker.provider);
            this._popupIsOpened = true;
        }

        public setPopupContent(content: string): void {
            this._infoWindow.setContent(content);
        }
    }
}
