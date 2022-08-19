// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace Provider.Leaflet.Marker {
    export namespace MarkerFactory {
        export function MakeMarker(
            map: OSFramework.Maps.OSMap.IMap,
            markerId: string,
            type: OSFramework.Maps.Enum.MarkerType,
            configs: Configuration.Marker.LeafletMarkerConfig
        ): OSFramework.Maps.Marker.IMarker {
            switch (type) {
                case OSFramework.Maps.Enum.MarkerType.Marker:
                    return new Marker(map, markerId, type, configs);
                case OSFramework.Maps.Enum.MarkerType.MarkerPopup:
                    return new MarkerPopup(map, markerId, type, configs);
                default:
                    throw new Error(
                        `There is no factory for this type of Marker (${type})`
                    );
            }
        }
    }
}
