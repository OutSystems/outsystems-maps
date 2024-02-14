// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace OSFramework.Maps.Feature {
    export interface IMarkerClusterer {
        /** Checks if the marker clusterer feature is activated */
        isEnabled: boolean;
        /** Gets the marker  */
        markerClusterer: GoogleMapsMarkerClusterer;
        /**
         * Adds a marker into the cluster
         * @param marker Marker Object from OSFramework that is going to be added into the cluster
         */
        addMarker(marker: OSFramework.Maps.Marker.IMarker): void;
        /**
         * Sets the marker clusterer configs
         * @param configs Configurations from the structure MarkerClusterer
         */
        changeProperty(propertyName: string, value: unknown): void;
        /**
         * Removes a marker from the cluster
         * @param marker Marker Object from OSFramework that is going to be removed from the cluster
         */
        removeMarker(marker: OSFramework.Maps.Marker.IMarker): void;
        /** Repaints the whole cluster, invoking all the operations from the provider related to the repainting */
        repaint(): void;

        /**
         * Sets the custom renderer of the marker clusters.
         *
         * @param {IMarkerClusterer} renderer - Renderer object to create the clusters. If undefined if passed the default render will be used.
         * @memberof IMarkerClusterer
         */
        setClusterRenderer(renderer: IMarkerClustererRender);
    }
}
