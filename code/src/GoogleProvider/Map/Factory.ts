// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace GoogleProvider.Map {
    export namespace MapFactory {
        export function MakeMap(
            type: OSFramework.Enum.MapType,
            mapdId: string,
            configs: OSFramework.Configuration.IConfiguration
        ): OSFramework.OSMap.IMap {
            switch (type) {
                case OSFramework.Enum.MapType.GoogleMaps:
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    return new Map(
                        mapdId,
                        configs as Configuration.OSMap.GoogleMapConfig
                    );
                case OSFramework.Enum.MapType.GoogleStaticMaps:
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
