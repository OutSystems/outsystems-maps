/**
 * Used to store the tags used to find DOM elements
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace OSFramework.Helper.Constants {
    /** Tag used to find Map */
    export const mapTag = '[data-block="Maps.Map"]';
    /** Tag used to find StaticMap */
    export const staticMapTag = '[data-block="Maps.StaticMap"]';
    /** Tag used to find a generic widget */
    export const outsystemsWidgetTag = '[data-block]';
    /** Tag used to find the container where the Map's uniqueId was defined */
    export const mapUniqueIdCss = '.map-container';
    /** Tag used to find the uniqueId property of a DOM element */
    export const uniqueIdAttribute = 'name';
    /** Default position for the Map on initialize (should get changed after the promise that converts the address into coordinates) */
    export const defaultMapCenter = { lat: 42.3517926, lng: -71.0467845 };
    /** Zoom that is going to be applied when the zoom is set to 0 (Auto Fit) */
    export const zoomAutofit = Enum.OSMap.Zoom.Zoom8;
    /** URL for GoogleMapsApi  */
    export const googleMapsApiURL = 'https://maps.googleapis.com/maps/api';
    export const googleMapsApiGeocode = `${googleMapsApiURL}/geocode/json`;
    export const googleMapsApiMap = `${googleMapsApiURL}/js`;
    export const googleMapsApiStaticMap = `${googleMapsApiURL}/staticmap`;
    export const staticMapCss = '.staticMap-image';
}
