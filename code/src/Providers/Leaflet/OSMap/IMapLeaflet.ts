// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace LeafletProvider.OSMap {
    export interface IMapLeaflet extends OSFramework.OSMap.IMapGeneric<L.Map> {
        addedEvents: Array<string>;
    }
}
