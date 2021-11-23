// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace GoogleProvider.OSMap {
    export namespace MapFactory {
        export function MakeMap(
            type: OSFramework.Enum.ProviderType,
            mapdId: string,
            configs: OSFramework.Configuration.IConfiguration
        ): OSFramework.OSMap.IMap {
            switch (type) {
                case OSFramework.Enum.ProviderType.GoogleMaps:
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    return new Map(
                        mapdId,
                        configs as Configuration.OSMap.GoogleMapConfig
                    );
                case OSFramework.Enum.ProviderType.GoogleStaticMaps:
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    return new StaticMap(
                        mapdId,
                        configs as Configuration.OSMap.GoogleStaticMapConfig
                    );
                default:
                    throw `There is no factory for this type of Map (${type})`;
            }
        }
    }
}
