// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace Provider.Leaflet.OSMap {
    export namespace MapFactory {
        export function MakeMap(
            type: OSFramework.Enum.MapType,
            mapdId: string,
            configs: OSFramework.Configuration.IConfiguration
        ): OSFramework.OSMap.IMap {
            switch (type) {
                case OSFramework.Enum.MapType.Map:
                    return new Map(
                        mapdId,
                        configs as Configuration.OSMap.LeafletMapConfig
                    );
                //Right now there is no StaticMap for the Leaflet provider
                case OSFramework.Enum.MapType.StaticMap:
                default:
                    throw new Error(`There is no factory for this type of Map (${type})`);
            }
        }
    }
}
