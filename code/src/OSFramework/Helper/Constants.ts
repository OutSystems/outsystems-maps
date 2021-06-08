/**
 * Used to store the tags used to find DOM elements
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace OSFramework.Helper.Constants {
    /************************** */
    /**       DATA BLOCKS       */
    /************************** */
    /** Tag used to find Map */
    export const mapTag = '[data-block="Maps.Map"]';
    /** Tag used to find Generic Markers */
    export const markerGeneric = '[data-block*="Marker.Marker"]';
    /** Tag used to find Marker */
    export const markerTag = '[data-block="Marker.Marker"]';
    /** Tag used to find MarkerPopup */
    export const markerPopupTag = '[data-block="Marker.MarkerPopup"]';

    /** Tag used to find a generic widget */
    export const outsystemsWidgetTag = '[data-block]';
    /** Tag used to find StaticMap */
    export const staticMapTag = '[data-block="Maps.StaticMap"]';

    /************************** */
    /**        DOM Tags         */
    /************************** */
    /** Tag used to find the container where the Map is going to be rendered in run time*/
    export const runtimeMapUniqueIdCss = '.runtime-map-container';
    /** Tag used to find the container where the Map's uniqueId was defined */
    export const mapUniqueIdCss = '.map-container';
    /** Tag used to find the container where the Popup of the MarkerPopup was defined */
    export const markerPopup = '.marker-preview-popup';
    /** Tag used to find the container where the Marker's uniqueId was defined */
    export const markerUniqueIdCss = '.ss-marker';
    /** Tag used to find the container where the StaticMap Image was defined */
    export const staticMapCss = '.staticMap-image';
    /** Tag used to find the uniqueId property of a DOM element */
    export const uniqueIdAttribute = 'name';

    /************************** */
    /**       DEF VALUES        */
    /************************** */
    /** Default position for the Map on initialize (should get changed after the promise that converts the address into coordinates) */
    export const defaultMapCenter = { lat: 42.3517926, lng: -71.0467845 };
    /** Zoom that is going to be applied when the zoom is set to 0 (Auto Fit) */
    export const zoomAutofit = Enum.OSMap.Zoom.Zoom8;

    /************************** */
    /** URL for GoogleMapsApis  */
    /************************** */
    export const googleMapsApiURL = 'https://maps.googleapis.com/maps/api';
    /** URL for GoogleMaps API to get coordinates by Address/Location */
    export const googleMapsApiGeocode = `${googleMapsApiURL}/geocode/json`;
    /** URL for GoogleMaps API to make use of the Google Map */
    export const googleMapsApiMap = `${googleMapsApiURL}/js`;
    /** URL for GoogleMaps API to make use of the Google StaticMap */
    export const googleMapsApiStaticMap = `${googleMapsApiURL}/staticmap`;
}
