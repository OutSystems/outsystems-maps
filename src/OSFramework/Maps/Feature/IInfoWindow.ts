// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace OSFramework.Feature {
    export interface IInfoWindow {
        /** Closes the popup / infowindow */
        closePopup(marker?: OSFramework.Marker.IMarkerPopup): void;
        /** Opens the popup / infowindow anchored on the marker popup block */
        openPopup(marker: OSFramework.Marker.IMarkerPopup): void;
        /** Sets the popup content */
        setPopupContent(
            content: string,
            marker?: OSFramework.Marker.IMarkerPopup
        ): void;
    }
}
