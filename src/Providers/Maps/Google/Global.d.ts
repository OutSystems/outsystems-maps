import {
    DefaultRenderer as OriginalDefaultRenderer,
    MarkerClusterer as OriginalMarkerClusterer,
    MarkerClustererOptions as OriginalMarkerClustererOptions,
    SuperClusterAlgorithm as OriginalSuperClusterAlgorithm, Cluster as OriginalCluster
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
    type Cluster = OriginalCluster;
    type MarkerClusterer = OriginalMarkerClusterer;
    type MarkerClustererOptions = OriginalMarkerClustererOptions;
    type SuperClusterAlgorithm = OriginalSuperClusterAlgorithm;
}
window.GMCB = window.GMCB || {};
