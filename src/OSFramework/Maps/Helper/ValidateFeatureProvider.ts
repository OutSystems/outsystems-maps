// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace OSFramework.Maps.Helper {
    /** This is a temporary method that will allow checking if the feature is already implemented for the Leaflet provider */
    export function ValidateFeatureProvider(
        map: OSMap.IMap,
        feature: Enum.Feature
    ): boolean {
        // If the feature is for Google Maps, then it should always be valid
        // Else, if the feature is for Leaflet, check if it's valid depending on the feature
        // If it's not valid, return false and throw a console warning
        if (map.providerType === Enum.ProviderType.Google) return true;
        switch (feature) {
            case Enum.Feature.Marker:
            case Enum.Feature.MarkerPopup:
            case Enum.Feature.Shapes:
            case Enum.Feature.Directions:
            case Enum.Feature.DrawingTools:
                return true;
            case Enum.Feature.HeatmapLayer:
            case Enum.Feature.FileLayer:
            default:
                console.warn(
                    `Feature ${feature} is not implemented for the Map Leaflet`
                );
                return false;
        }
    }
}
