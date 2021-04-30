// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace GoogleProvider.Marker {
    export namespace MarkerFactory {
        export function MakeMarker(
            map: OSFramework.OSMap.IMap,
            markerId: string,
            configs: OSFramework.Configuration.IConfiguration
        ): OSFramework.Marker.IMarker {
            return new Marker(
                map,
                markerId,
                configs as OSFramework.Configuration.Marker.GoogleMarkerConfig
            );
        }
    }
}