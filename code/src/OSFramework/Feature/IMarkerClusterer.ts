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
        /**
         * Sets the marker clusterer configs
         * @param configs Configurations from the structure MarkerClusterer
         */
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        changeProperty(propertyName: string, value: any): void;
        /**
         * Removes a marker from the cluster
         * @param marker Marker Object from OSFramework that is going to be removed from the cluster
         */
        removeMarker(marker: OSFramework.Marker.IMarker): void;
        /** Repaints the whole cluster, invoking all the operations from the provider related to the repainting */
        repaint(): void;
    }
}
