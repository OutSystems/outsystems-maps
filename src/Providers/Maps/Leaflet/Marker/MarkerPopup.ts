/// <reference path="../../../OSFramework/Marker/AbstractMarker.ts" />

// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace Provider.Leaflet.Marker {
    export class MarkerPopup
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        extends Marker
        implements OSFramework.Maps.Marker.IMarkerPopup
    {
        private _contentString: string;

        protected _setMarkerEvents(): void {
            super._setMarkerEvents();

            // Open the popup when the user clicks on the Marker
            // To close the Marker use the ESC or the "x" on the top right corner of the popup
            // Or use the API method - closePopup()
            this._provider.addEventListener('click', () => {
                this.openPopup();
            });
        }

        public get hasPopup(): boolean {
            return true;
        }

        public get markerTag(): string {
            return OSFramework.Maps.Helper.Constants.markerPopupTag;
        }

        public closePopup(): void {
            this.map.features.infoWindow.closePopup(this);
        }

        public openPopup(): void {
            this.refreshPopupContent();
            this.map.features.infoWindow.openPopup(this);
        }

        public refreshPopupContent(): void {
            this._contentString = OSFramework.Maps.Helper.GetElementByUniqueId(
                this.uniqueId
            ).querySelector(
                OSFramework.Maps.Helper.Constants.markerPopup
            ).innerHTML;
            this.map.features.infoWindow.setPopupContent(
                this._contentString,
                this
            );
        }
    }
}
