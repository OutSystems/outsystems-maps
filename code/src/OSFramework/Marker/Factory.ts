// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace OSFramework.Marker {
    export namespace MarkerFactory {
        export function MakeMarker(
            map: OSMap.IMap,
            markerId: string,
            type: Enum.MarkerType,
            configs: Configuration.IConfiguration
        ): Marker.IMarker {
            switch (map.providerType) {
                case Enum.ProviderType.Google:
                    return GoogleProvider.Marker.MarkerFactory.MakeMarker(
                        map,
                        markerId,
                        type,
                        configs as GoogleProvider.Configuration.Marker.GoogleMarkerConfig
                    );

                case Enum.ProviderType.Leaflet:
                    return LeafletProvider.Marker.MarkerFactory.MakeMarker(
                        map,
                        markerId,
                        type,
                        configs as LeafletProvider.Configuration.Marker.LeafletMarkerConfig
                    );
                default:
                    throw `There is no factory for the Marker using the provider ${map.providerType}`;
            }
        }
    }
}
