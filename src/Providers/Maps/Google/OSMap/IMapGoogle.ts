// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace Provider.Google.OSMap {
    export interface IMapGoogle
        extends OSFramework.Maps.OSMap.IMapGeneric<google.maps.Map> {
        addedEvents: Array<string>;
    }
}
