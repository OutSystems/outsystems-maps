// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace OSFramework.Feature {
    export interface IMarkerClusterer {
        /** Checks if the marker clusterer feature is activated */
        isEnabled: boolean;
        /** Gets the marker  */
        markerClusterer: MarkerClusterer;
        /**
         * Adds a marker into the cluster
         * @param marker Marker Object from OSFramework that is going to be added into the cluster
         */
        addMarker(marker: OSFramework.Marker.IMarker): void;
        /** Repaints the whole cluster, invoking all the operations from the provider related to the repainting */
        repaint(): void;
        /**
         * Sets the marker clusterer configs
         * @param configs Configurations from the structure MarkerClusterer
         */
        setMarkerClusterer(
            configs: OSFramework.OSStructures.OSMap.MarkerClusterer
        ): void;
    }
}
