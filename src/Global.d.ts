import {
    DefaultRenderer as OriginalDefaultRenderer,
    MarkerClusterer as OriginalMarkerClusterer,
    MarkerClustererOptions as OriginalMarkerClustererOptions,
    SuperClusterAlgorithm as OriginalSuperClusterAlgorithm, Cluster as OriginalCluster,
    Renderer as OriginalRenderer,
    Algorithm as OriginalAlgorithm
} from '@googlemaps/markerclusterer';

declare global {
    //Adding object that will be available globally in runtime.
    interface Window {
        GMCB: () => void;
        markerClusterer: {
            DefaultRenderer: typeof OriginalDefaultRenderer,
            MarkerClusterer: typeof OriginalMarkerClusterer,
            SuperClusterAlgorithm: typeof OriginalSuperClusterAlgorithm,
        }; 
    }
    //The types below, are useful for TypeScript intellisense.
    type GoogleMapsAlgorithm = OriginalAlgorithm;
    type GoogleMapsCluster = OriginalCluster;
    type GoogleMapsMarkerClusterer = OriginalMarkerClusterer;
    type GoogleMapsMarkerClustererOptions = OriginalMarkerClustererOptions;
    type GoogleMapsClusterRenderer = OriginalRenderer;
    type GoogleMapsSuperClusterAlgorithm = OriginalSuperClusterAlgorithm;
    type GoogleAdvancedFormatObj = {JSON, mapEvents: string[]};
}
window.GMCB = window.GMCB || {};
