// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace LeafletProvider.Constants.OSMap {
    /**
     * Array of strings that define the available Provider Events
     */
    export const Events = [
        'bounds_changed',
        'center_changed',
        'click',
        'contextmenu',
        'dblclick',
        'drag',
        'dragend',
        'dragstart',
        'heading_changed',
        'idle',
        'maptypeid_changed',
        'mousemove',
        'mouseout',
        'mouseover',
        'projection_changed',
        'resize',
        'rightclick',
        'tilesloaded',
        'tilt_changed',
        'zoom_changed'
    ];

    // Because the events from SS will have the default event names from the previous list,
    // We need to convert them into the respective provider event names (Leaflet provider)
    // You can see the available events here: https://leafletjs.com/reference.html#map-event
    // Some of the events are not available unless they are written down on this list
    export enum ProviderEventNames {
        // bounds_changed = 'bounds_changed',
        // center_changed = 'center_changed',
        click = 'click',
        contextmenu = 'contextmenu',
        dblclick = 'dblclick',
        drag = 'drag',
        dragend = 'dragend',
        dragstart = 'dragstart',
        // heading_changed = 'heading_changed',
        // idle = 'idle',
        // maptypeid_changed = 'maptypeid_changed',
        mousemove = 'mousemove',
        mouseout = 'mouseout',
        mouseover = 'mouseover',
        // projection_changed = 'projection_changed',
        resize = 'resize',
        rightclick = 'contextmenu',
        tilesloaded = 'load',
        // tilt_changed = 'tilt_changed',
        zoom_changed = 'zoom'
    }
}
