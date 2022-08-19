// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace OSFramework.Maps.Marker {
    export namespace MarkerFactory {
        export function MakeMarker(
            map: OSMap.IMap,
            markerId: string,
            type: Enum.MarkerType,
            configs: Configuration.IConfiguration
        ): Marker.IMarker {
            switch (map.providerType) {
                case Enum.ProviderType.Google:
                    return Provider.Google.Marker.MarkerFactory.MakeMarker(
                        map,
                        markerId,
                        type,
                        configs as Provider.Google.Configuration.Marker.GoogleMarkerConfig
                    );

                case Enum.ProviderType.Leaflet:
                    return Provider.Leaflet.Marker.MarkerFactory.MakeMarker(
                        map,
                        markerId,
                        type,
                        configs as Provider.Leaflet.Configuration.Marker.LeafletMarkerConfig
                    );
                default:
                    throw new Error(
                        `There is no factory for the Marker using the provider ${map.providerType}`
                    );
            }
        }
    }
}
