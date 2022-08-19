// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace OSFramework.Maps.Marker {
    export interface IMarkerPopup extends IMarker {
        /**
         * Closes the popup of the Marker when the Marker has a popup
         */
        closePopup(): void;
        /**
         * Opens the popup of the Marker when the Marker has a popup
         */
        openPopup(): void;
        /**
         * Forces the refresh of the content inside the popup
         */
        refreshPopupContent(): void;
    }
}
