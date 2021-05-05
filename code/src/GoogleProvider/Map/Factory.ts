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
                    return new Map(
                        mapdId,
                        configs as OSFramework.Configuration.OSMap.GoogleMapConfig
                    );
                default:
                    throw `There is no factory for this type of Map (${type})`;
            }
        }
    }
}
