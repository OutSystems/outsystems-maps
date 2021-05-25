// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace GoogleProvider.Marker {
    export namespace MarkerFactory {
        export function MakeMarker(
            map: OSFramework.OSMap.IMap,
            markerId: string,
            configs: OSFramework.Configuration.IConfiguration
        ): OSFramework.Marker.IMarker {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            return new Marker(
                map,
                markerId,
                configs as Configuration.Marker.GoogleMarkerConfig
            );
        }
    }
}
