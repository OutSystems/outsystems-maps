// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace Provider.Leaflet.OSMap {
    export interface IMapLeaflet extends OSFramework.OSMap.IMapGeneric<L.Map> {
        addedEvents: Array<string>;
    }
}
