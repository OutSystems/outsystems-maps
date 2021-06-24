// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace GoogleProvider.Marker {
    export namespace MarkerFactory {
        export function MakeMarker(
            map: OSFramework.OSMap.IMap,
            markerId: string,
            type: OSFramework.Enum.MarkerType,
            configs: OSFramework.Configuration.IConfiguration
        ): OSFramework.Marker.IMarker {
            switch (type) {
                case OSFramework.Enum.MarkerType.Marker:
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    return new Marker(
                        map,
                        markerId,
                        type,
                        configs as Configuration.Marker.GoogleMarkerConfig
                    );
                case OSFramework.Enum.MarkerType.MarkerPopup:
                    return new MarkerPopup(
                        map,
                        markerId,
                        type,
                        configs as Configuration.Marker.GoogleMarkerConfig
                    );
                default:
                    throw `There is no factory for this type of Marker (${type})`;
            }
        }
    }
}
