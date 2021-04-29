// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace OSFramework.Helper {
    export function IsMapReady(mapId: string): boolean {
        try {
            const map = MapAPI.MapManager.GetMapById(mapId);
            return map.isReady;
        } catch (error) {
            return false;
        }
    }
}
