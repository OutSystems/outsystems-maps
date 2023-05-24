import OriginalMarkerClusterer from '@googlemaps/markerclustererplus';

declare global {
    interface Window {
        GMCB: () => void;
        MarkerClusterer: typeof OriginalMarkerClusterer; 
    }
    type MarkerClusterer = OriginalMarkerClusterer;
}
window.GMCB = window.GMCB || {};
