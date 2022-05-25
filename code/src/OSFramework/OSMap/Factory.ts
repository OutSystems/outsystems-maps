// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace OSFramework.OSMap {
    export namespace MapFactory {
        export function MakeMap(
            provider: Enum.ProviderType,
            type: Enum.MapType,
            mapdId: string,
            configs: Configuration.IConfiguration
        ): OSMap.IMap {
            switch (provider) {
                case Enum.ProviderType.Google:
                    return Provider.Google.OSMap.MapFactory.MakeMap(
                        type,
                        mapdId,
                        configs
                    );
                case Enum.ProviderType.Leaflet:
                    return Provider.Leaflet.OSMap.MapFactory.MakeMap(
                        type,
                        mapdId,
                        configs
                    );
                default:
                    throw new Error(
                        `There is no factory for this Map provider (${provider})`
                    );
            }
        }
    }
}
