import {
    DefaultRenderer as OriginalDefaultRenderer,
    MarkerClusterer as OriginalMarkerClusterer,
    MarkerClustererOptions as OriginalMarkerClustererOptions,
    SuperClusterAlgorithm as OriginalSuperClusterAlgorithm, Cluster as OriginalCluster,
    Renderer as OriginalRenderer,
    Algorithm as OriginalAlgorithm
} from '@googlemaps/markerclusterer';
import type * as TerraDrawLib from 'terra-draw';

declare global {
    //Adding object that will be available globally in runtime.
    interface Window {
        GMCB: () => void;
        markerClusterer: {
            DefaultRenderer: typeof OriginalDefaultRenderer,
            MarkerClusterer: typeof OriginalMarkerClusterer,
            SuperClusterAlgorithm: typeof OriginalSuperClusterAlgorithm,
        };
        terraDraw: typeof TerraDrawLib;
        terraDrawGoogleMapsAdapter: {
            TerraDrawGoogleMapsAdapter: new (config: {
                map: google.maps.Map;
                lib: typeof google.maps;
                coordinatePrecision?: number;
            }) => TerraDrawLib.TerraDrawExtend.TerraDrawBaseAdapter;
        };
    }
    //The types below, are useful for TypeScript intellisense.
    type GoogleMapsAlgorithm = OriginalAlgorithm;
    type GoogleMapsCluster = OriginalCluster;
    type GoogleMapsMarker = google.maps.Marker | google.maps.marker.AdvancedMarkerElement;
    type GoogleMapsMarkerOptions = google.maps.MarkerOptions | google.maps.marker.AdvancedMarkerElementOptions;
    type GoogleMapsMarkerClusterer = OriginalMarkerClusterer;
    type GoogleMapsMarkerClustererOptions = OriginalMarkerClustererOptions;
    type GoogleMapsClusterRenderer = OriginalRenderer;
    type GoogleMapsSuperClusterAlgorithm = OriginalSuperClusterAlgorithm;
    type GoogleAdvancedFormatObj = {JSON, mapEvents: string[]};
    // TerraDraw type aliases for use across provider source files
    type TerraDrawInstance = InstanceType<typeof TerraDrawLib.TerraDraw>;
    type TerraDrawGeoJSONFeature = TerraDrawLib.GeoJSONStoreFeatures;
    type TerraDrawFeatureId = TerraDrawLib.GeoJSONStoreFeatures['id'];
    /** Hex colour accepted by TerraDraw style properties (must start with '#'). */
    type TerraDrawHexColor = `#${string}`;
    /** Base class for all TerraDraw draw modes. */
    type TerraDrawBaseDrawMode = TerraDrawLib.TerraDrawExtend.TerraDrawBaseDrawMode;
    /**
     * Intersection that satisfies the framework's IDrawingToolsProvider generic
     * constraint (all-optional methods) while preserving TerraDraw's typed API.
     * At runtime the object is always a plain TerraDrawInstance.
     */
    type TerraDrawProviderCompatible = TerraDrawInstance & {
        addListener?: never;
        get?: never;
        getPosition?: never;
        setDrawingOptions?: never;
        setOptions?: never;
    };
}
window.GMCB = window.GMCB || {};
