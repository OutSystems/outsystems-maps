import OriginalMarkerClusterer from '@googlemaps/markerclustererplus';

declare global {
    //eslint-disable-next-line @typescript-eslint/naming-convention
    interface Window {
        MarkerClusterer: typeof OriginalMarkerClusterer;
    }
    type MarkerClusterer = OriginalMarkerClusterer;
}
