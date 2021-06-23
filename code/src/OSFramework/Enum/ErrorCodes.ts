// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace OSFramework.Enum {
    /**
     * Codes that get the associated to specific returning messages indicated wheter the action had success or not.
     */
    export enum ErrorCodes {
        // Error Codes - CONFiguration errors - Any error related with missing or wrong configuration of the application.
        CONF_APIKeyAlreadySetMap = 'MAPS-CONF-01001',
        CONF_APIKeyAlreadySetStaticMap = 'MAPS-CONF-02001',

        // Error Codes - LIB errors - Specific errors generated when consuming a third party lib / providers
        LIB_InvalidApiKeyMap = 'MAPS-LIB-01001',
        LIB_FailedGeocodingMap = 'MAPS-LIB-01002',
        LIB_InvalidApiKeyStaticMap = 'MAPS-LIB-02001',
        LIB_FailedGeocodingMarker = 'MAPS-LIB-03001',
        LIB_FailedSetDirections = 'MAPS-LIB-04001',

        // Error Codes - API errors - Specific errors generated when exposing the component client actions API/Framework.
        API_FailedRemoveDirections = 'MAPS-API-03001'

        // Error Codes - GENeral error - General or internal Errors of the component. In the situation of simple components without different features/sections inside it, the GEN acronym should be used.
        // Example : MAPS-GEN-01001 Cannot decrypt the content
    }
}
