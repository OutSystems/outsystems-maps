// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace Provider.Google.OSMap {
    export namespace MapFactory {
        export function MakeMap(
            type: OSFramework.Maps.Enum.MapType,
            mapdId: string,
            configs: OSFramework.Maps.Configuration.IConfiguration
        ): OSFramework.Maps.OSMap.IMap {
            switch (type) {
                case OSFramework.Maps.Enum.MapType.Map:
                    return new Map(
                        mapdId,
                        configs as Configuration.OSMap.GoogleMapConfig
                    );
                case OSFramework.Maps.Enum.MapType.StaticMap:
                    return new StaticMap(
                        mapdId,
                        configs as Configuration.OSMap.GoogleStaticMapConfig
                    );
                default:
                    throw new Error(
                        `There is no factory for this type of Map (${type})`
                    );
            }
        }
    }
}
