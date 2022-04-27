// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace Provider.Google.Marker {
    export namespace MarkerFactory {
        export function MakeMarker(
            map: OSFramework.OSMap.IMap,
            markerId: string,
            type: OSFramework.Enum.MarkerType,
            configs: Configuration.Marker.GoogleMarkerConfig
        ): OSFramework.Marker.IMarker {
            switch (type) {
                case OSFramework.Enum.MarkerType.Marker:
                    return new Marker(map, markerId, type, configs);
                case OSFramework.Enum.MarkerType.MarkerPopup:
                    return new MarkerPopup(map, markerId, type, configs);
                default:
                    throw new Error(`There is no factory for this type of Marker (${type})`);
            }
        }
    }
}
