// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace OSFramework.Maps.Marker {
    export namespace MarkerFactory {
        export function MakeMarker(
            map: OSMap.IMap,
            markerId: string,
            type: Enum.MarkerType,
            configs: JSON
        ): Marker.IMarker {
            switch (map.providerType) {
                case Enum.ProviderType.Google:
                    return Provider.Maps.Google.Marker.MarkerFactory.MakeMarker(
                        map,
                        markerId,
                        type,
                        configs
                    );

                case Enum.ProviderType.Leaflet:
                    return Provider.Maps.Leaflet.Marker.MarkerFactory.MakeMarker(
                        map,
                        markerId,
                        type,
                        configs
                    );
                default:
                    throw new Error(
                        `There is no factory for the Marker using the provider ${map.providerType}`
                    );
            }
        }
    }
}
