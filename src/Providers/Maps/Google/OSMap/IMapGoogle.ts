// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace Provider.Maps.Google.OSMap {
    export interface IMapGoogle
        extends OSFramework.Maps.OSMap.IMapGeneric<google.maps.Map> {
        addedEvents: Array<string>;
    }
}
