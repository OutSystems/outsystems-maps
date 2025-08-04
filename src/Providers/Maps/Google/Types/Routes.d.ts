namespace Provider.Maps.Google.Types {

    export interface LocationCoordinates {
        latitude: number;
        longitude: number;
    }

    export interface LocationPoint {
        location?: {
            latLng: LocationCoordinates,
        },
        address?: string
    }
    
    // Waypoint interface for the Google Maps Routes API
    export interface Waypoint {
        via: boolean,
        vehicleStopover?: boolean,
        sideOfRoad?: boolean,

        // Union field location_type can be only one of the following:
        location?: {
            latLng: LocationCoordinates,
            heading?: integer
        },
        placeId?: string,
        address?: string
        // End of list of possible types for union field location_type.
    }

    // Request body for the Google Maps Routes API
    export interface RoutesRequestBody{
        origin: LocationPoint,
        destination: LocationPoint,
        intermediates: LocationPoint[],
        travelMode: string,
        routingPreference?: "TRAFFIC_UNAWARE" | "TRAFFIC_AWARE" | "TRAFFIC_AWARE_OPTIMAL",
        computeAlternativeRoutes?: boolean,
        routeModifiers?: {
            avoidTolls: boolean,
            avoidHighways: boolean,
            avoidFerries: boolean
        },
        languageCode?: string,
        units?: string,
    }
    
    // Response body for the Google Maps Routes API
    // This is a simplified version of the response, only including the fields we need.
    export interface RoutesResponse {   
        routes: [
            {
                distanceMeters: number,
                duration: string,
                polyline: {
                    encodedPolyline: string
                },
                legs: [{
                    steps: [RoutesResponseLegStep]
                }]
            }
        ]
    }

    // Each step in the leg of the route
    export interface RoutesResponseLegStep {
        distanceMeters: number,
        staticDuration: string,
        polyline: {
            encodedPolyline: string
        },
        startLocation: {
            latLng: {
                latitude: number,
                longitude: number
            }
        },
        endLocation: {
            latLng: {
                latitude: number,
                longitude: number
            }
        },
        navigationInstruction: {
            maneuver: string,
            instructions: string
        },
        localizedValues: {
            distance: {
                text: string
            },
        
            staticDuration: {
                text: string
            }
        },
        travelMode: string
    };

    // Enum for the travel modes supported by the Google Maps Routes API
    export const enum TravelModes {
        "DRIVING" = "DRIVE",
        "BICYCLING" = "BICYCLE",
        "WALKING" = "WALK",
        "TWO_WHEELER" = "TWO_WHEELER"
    }
}