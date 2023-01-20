// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace OSFramework.Maps.Enum {
    /**
     * Codes that get the associated to specific returning messages indicated wheter the action had success or not.
     */
    export const Success = {
        code: '200',
        message: 'Success'
    };

    export const Unsupported = {
        code: 'MAPS-GEN-01003',
        message:
            'The action ContainsLocation can’t verify if a given marker is inside a Polyline shape. Please, change the ShapeWidgetId parameter to a Circle, Rectangle, or Polygon.'
    };

    export enum ErrorCodes {
        // Error Codes - CONFiguration errors - Any error related with missing or wrong configuration of the application.
        CFG_APIKeyAlreadySetMap = 'MAPS-CFG-01001',
        CFG_APIKeyAlreadySetStaticMap = 'MAPS-CFG-02001',
        CFG_CantChangeParamsStaticMap = 'MAPS-CFG-02002',
        CFG_InvalidPolylineShapeLocations = 'MAPS-CFG-05001',
        CFG_InvalidPolygonShapeLocations = 'MAPS-CFG-05002',
        CFG_InvalidCircleShapeCenter = 'MAPS-CFG-05003',
        CFG_InvalidRectangleShapeBounds = 'MAPS-CFG-05004',
        CFG_APIKeyDiffersFromPlacesToMaps = 'MAPS-CFG-01002',
        CFG_APIKeyAlreadySetSearchPlaces = 'MAPS-CFG-10001',
        CFG_InvalidSearchPlacesSearchArea = 'MAPS-CFG-10002',
        CFG_MaximumCountriesNumber = 'MAPS-CFG-10003',
        CFG_InvalidInputSearchPlaces = 'MAPS-CFG-10004',
        CFG_InvalidTravelMode = 'MAPS-CFG-04001',
        CFG_InvalidDrawingToolsPosition = 'MAPS-CFG-06001',
        CFG_InvalidMapId = 'MAPS-CFG-10005',

        // Error Codes - LIB errors - Specific errors generated when consuming a third party lib / providers
        LIB_InvalidApiKeyMap = 'MAPS-LIB-01001',
        LIB_FailedGeocodingMap = 'MAPS-LIB-01002',
        LIB_InvalidApiKeyStaticMap = 'MAPS-LIB-02001',
        LIB_FailedGeocodingMarker = 'MAPS-LIB-03001',
        LIB_FailedGeocodingLeafletMarker = 'MAPS-LIB-03002',
        LIB_FailedSetDirections = 'MAPS-LIB-04001',
        LIB_FailedGeocodingShapeLocations = 'MAPS-LIB-05001',
        LIB_FailedGeocodingLeafletShapeLocations = 'MAPS-LIB-05002',
        LIB_InvalidApiKeySearchPlaces = 'MAPS-LIB-10001',
        LIB_FailedGeocodingSearchAreaLocations = 'MAPS-LIB-10002',
        LIB_FailedGeocodingLeafletMap = 'MAPS-LIB-11001',

        // Error Codes - API errors - Specific errors generated when exposing the component client actions API/Framework.
        API_FailedRemoveDirections = 'MAPS-API-03001',
        API_FailedGettingShapePath = 'MAPS-API-05001',
        API_FailedGettingCircleShape = 'MAPS-API-05002',
        API_FailedGettingShapeCenter = 'MAPS-API-05003',
        API_FailedGettingShapeRadius = 'MAPS-API-05004',
        API_FailedLoadingPlugin = 'MAPS-API-04002',
        API_FailedNoPluginDirections = 'MAPS-API-04003',
        API_FailedRemoveMarkerFromCluster = 'MAPS-API-09001',
        API_FailedContainsLocation = 'MAPS-API-05005',
        API_FailedGettingCenterCoordinates = 'MAPS-API-01001',

        // Error Codes - GENeral error - General or internal Errors of the component. In the situation of simple components without different features/sections inside it, the GEN acronym should be used.
        GEN_InvalidChangePropertyMap = 'MAPS-GEN-01001',
        GEN_InvalidChangePropertyMarker = 'MAPS-GEN-03001',
        GEN_UnsupportedEventMap = 'MAPS-GEN-01002',
        GEN_UnsupportedEventMarker = 'MAPS-GEN-03002',
        GEN_InvalidChangePropertyShape = 'MAPS-GEN-05001',
        GEN_InvalidChangePropertyDrawingTools = 'MAPS-GEN-06001',
        GEN_InvalidChangePropertyTools = 'MAPS-GEN-06002',
        GEN_UnsupportedEventShape = 'MAPS-GEN-05002',
        GEN_UnsupportedEventDrawingTools = 'MAPS-GEN-06003',
        GEN_ToolTypeAlreadyExists = 'MAPS-GEN-06004',
        GEN_InvalidChangePropertyFileLayer = 'MAPS-GEN-07001',
        GEN_UnsupportedEventFileLayer = 'MAPS-GEN-07002',
        GEN_InvalidChangePropertyHeatmapLayer = 'MAPS-GEN-08001',
        GEN_InvalidChangePropertyMarkerClusterer = 'MAPS-GEN-09001',
        GEN_InvalidChangePropertySearchPlaces = 'MAPS-GEN-10001',
        GEN_UnsupportedEventSearchPlaces = 'MAPS-GEN-10002',
        GEN_NoPluginDirectionsNeeded = 'MAPS-GEN-04001'
    }
}
