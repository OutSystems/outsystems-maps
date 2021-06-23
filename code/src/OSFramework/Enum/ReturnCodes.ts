// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace OSFramework.Enum {
    /**
     * Codes that get the associated to specific returning messages indicated wheter the action had success or not.
     */
    export enum ReturnCodes {
        Success = 'E200',

        // Error Codes
        APIKeyAlreadySet = 'E400',
        InvalidApiKey = 'E401',
        DirectionsFailed = 'E402',
        FailedRemovingDirections = 'E403',
        LIB_FailedGeocodingMap = 'MAPS-LIB-01002',
        LIB_FailedGeocodingMarker = 'MAPS-LIB-03001'
    }
}
