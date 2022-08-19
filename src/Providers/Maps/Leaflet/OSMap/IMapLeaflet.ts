// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace Provider.Maps.Leaflet.OSMap {
    export interface IMapLeaflet
        extends OSFramework.Maps.OSMap.IMapGeneric<L.Map> {
        addedEvents: Array<string>;
    }
}
