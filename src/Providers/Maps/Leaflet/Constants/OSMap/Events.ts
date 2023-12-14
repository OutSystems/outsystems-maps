// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace Provider.Maps.Leaflet.Constants.OSMap {
    /**
     * Array of strings that define the available Provider Events
     */
    // Because the events from SS will have the default event names from the previous list,
    // We need to convert them into the respective provider event names (Leaflet provider)
    // You can see the available events here: https://leafletjs.com/reference.html#map-event
    // Some of the events are not available unless they are written down on this list
    export enum ProviderEventNames {
        click = 'click',
        contextmenu = 'contextmenu',
        rightclick = 'contextmenu',
        dblclick = 'dblclick',
        drag = 'drag',
        dragend = 'dragend',
        dragstart = 'dragstart',
        mousemove = 'mousemove',
        mouseout = 'mouseout',
        mouseover = 'mouseover',
        resize = 'resize',
        tilesloaded = 'load',
        load = 'load',
        zoom_changed = 'zoom',
        zoom_end = 'zoomend',
        zoom = 'zoom'
    }
}
