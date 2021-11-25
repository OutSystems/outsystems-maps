/// <reference path="../../OSFramework/Marker/AbstractMarker.ts" />

// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace GoogleProvider.Marker {
    export class MarkerPopup
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        extends Marker
        implements OSFramework.Marker.IMarkerPopup
    {
        private _contentString: string;

        protected _setMarkerEvents(events?: Array<string>): void {
            super._setMarkerEvents(events);

            // Open the popup when the user clicks on the Marker
            // To close the Marker use the ESC or the "x" on the top right corner of the popup
            // Or use the API method - closePopup()
            this._provider.addListener('click', () => {
                this.refreshPopupContent();
                this.openPopup();
            });
        }

        public get hasPopup(): boolean {
            return true;
        }

        public get markerTag(): string {
            return OSFramework.Helper.Constants.markerPopupTag;
        }

        public closePopup(): void {
            this.map.features.infoWindow.closePopup();
        }

        public openPopup(): void {
            this.refreshPopupContent();
            this.map.features.infoWindow.openPopup(this);
        }

        public refreshPopupContent(): void {
            this._contentString = OSFramework.Helper.GetElementByUniqueId(
                this.uniqueId
            ).querySelector(OSFramework.Helper.Constants.markerPopup).innerHTML;
            this.map.features.infoWindow.setPopupContent(this._contentString);
        }
    }
}
