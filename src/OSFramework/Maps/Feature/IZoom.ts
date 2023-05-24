// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace OSFramework.Maps.Feature {
    export interface IZoom {
        /** Boolean that indicates whether the Map is using Autofit (Zoom = Auto) or not */
        isAutofit: boolean;
        /** Current Zoom level of the Map that changes whenever a marker is added or by enabling the Autofit on Zoom feature */
        level: OSFramework.Maps.Enum.OSMap.Zoom;
        /** Refreshes the Zoom of the Map
         * Changes whenever a marker is added or by enabling the Autofit on Zoom feature
         */
        refreshZoom(): void;
        /** Set the Zoom level of the Map by setting the value that represents the level */
        setLevel(value: OSFramework.Maps.Enum.OSMap.Zoom): void;
    }
}
