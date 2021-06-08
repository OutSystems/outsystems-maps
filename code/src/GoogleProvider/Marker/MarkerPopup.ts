/// <reference path="../../OSFramework/Marker/AbstractMarker.ts" />

// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace GoogleProvider.Marker {
    export class MarkerPopup
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        extends Marker
        implements OSFramework.Marker.IMarkerPopup {
        private _infowindow: google.maps.InfoWindow;

        constructor(
            map: OSFramework.OSMap.IMap,
            markerId: string,
            type: OSFramework.Enum.MarkerType,
            // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
            configs: Configuration.Marker.GoogleMarkerConfig
        ) {
            super(map, markerId, type, configs);
        }

        private _setPopupContent(): void {
            const contentString = OSFramework.Helper.GetElementByUniqueId(
                this.uniqueId
            ).querySelector(OSFramework.Helper.Constants.markerPopup).innerHTML;

            this._infowindow.setContent(contentString);
        }

        protected _setMarkerEvents(events?: Array<string>): void {
            super._setMarkerEvents(events);

            // Open the popup when the user clicks on the Marker
            // To close the Marker use the ESC or the "x" on the top right corner of the popup
            // Or use the API method - closePopup()
            this._provider.addListener('click', () => {
                this.openPopup();
            });
        }

        public get hasPopup(): boolean {
            return true;
        }

        public get markerTag(): string {
            return OSFramework.Helper.Constants.markerPopupTag;
        }

        public build(): void {
            super.build();

            // Create the infowindow = popup containing all the content from the placeholder
            const contentString = OSFramework.Helper.GetElementByUniqueId(
                this.uniqueId
            ).querySelector(OSFramework.Helper.Constants.markerPopup).innerHTML;
            this._infowindow = new google.maps.InfoWindow({
                content: contentString
            });

            // When the element appears = domready event, refresh popup content
            this._infowindow.addListener(
                'domready',
                this._setPopupContent.bind(this)
            );
        }

        public closePopup(): void {
            this._infowindow.close();
        }

        public openPopup(): void {
            this._infowindow.open(this.map.provider, this._provider);
        }

        public refreshPopupContent(): void {
            this._setPopupContent();
        }
    }
}
