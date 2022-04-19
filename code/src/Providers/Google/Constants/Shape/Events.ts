// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace GoogleProvider.Constants.Shape {
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
        'position_changed',
        'rightclick',
        'insert_at',
        'remove_at',
        'set_at',
        'radius_changed',
        'center_changed',
        'shape_changed'
    ];

    export const ProviderPolyshapeEvents = ['insert_at', 'remove_at', 'set_at'];

    export const ProviderCircleEvents = ['radius_changed', 'center_changed'];

    export const ProviderRectangleEvents = ['bounds_changed'];

    export const ProviderSpecialEvents = [
        'shape_changed',
        ...ProviderPolyshapeEvents,
        ...ProviderCircleEvents,
        ...ProviderRectangleEvents
    ];
}
