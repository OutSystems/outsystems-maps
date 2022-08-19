// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace OSFramework.Maps.Feature {
    export interface IInfoWindow {
        /** Closes the popup / infowindow */
        closePopup(marker?: OSFramework.Maps.Marker.IMarkerPopup): void;
        /** Opens the popup / infowindow anchored on the marker popup block */
        openPopup(marker: OSFramework.Maps.Marker.IMarkerPopup): void;
        /** Sets the popup content */
        setPopupContent(
            content: string,
            marker?: OSFramework.Maps.Marker.IMarkerPopup
        ): void;
    }
}
