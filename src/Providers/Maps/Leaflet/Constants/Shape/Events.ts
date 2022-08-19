// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace Provider.Maps.Leaflet.Constants.Shape {
    /**
     * Array of strings that define the available Provider Events
     */
    export const Events = [
        'click',
        'contextmenu',
        'dblclick',
        'drag',
        'dragend',
        'dragstart',
        'mousedown',
        'mouseout',
        'mouseover',
        'mouseup',
        'rightclick',
        'shape_changed',
        'editable:editing'
    ];

    export const ProviderPolyshapeEvents = ['editable:editing', 'dragend'];

    // Until Release v1.6.0 the events from Circle and Rectangle are the same as the ones for the Polyline and Polygon (polyshapes)
    export const ProviderCircleEvents = ProviderPolyshapeEvents;
    export const ProviderRectangleEvents = ProviderPolyshapeEvents;

    export const ProviderSpecialEvents = [
        'shape_changed',
        ...ProviderPolyshapeEvents,
        ...ProviderCircleEvents,
        ...ProviderRectangleEvents
    ];
}
