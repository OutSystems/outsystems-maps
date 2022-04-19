// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace Provider.Leaflet.Constants.Directions.OSRM {
    /**
     * Enum that defines the available OSRM TravelModes
     */
    export enum TravelModes {
        DRIVING = 'car',
        BICYCLING = 'bike',
        WALKING = 'foot'
    }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace LeafletProvider.Constants.Directions.MapBox {
    /**
     * Enum that defines the available MapBox TravelModes
     */
    export enum TravelModes {
        DRIVING = 'mapbox/driving',
        BICYCLING = 'mapbox/cycling',
        WALKING = 'mapbox/walking'
    }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace LeafletProvider.Constants.Directions.GraphHopper {
    /**
     * Enum that defines the available GraphHopper TravelModes
     */
    export enum TravelModes {
        DRIVING = 'car',
        BICYCLING = 'bike',
        WALKING = 'foot'
    }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace LeafletProvider.Constants.Directions.TomTom {
    /**
     * Enum that defines the available TomTom TravelModes
     */
    export enum TravelModes {
        DRIVING = 'car',
        BICYCLING = 'bicycle',
        WALKING = 'pedestrian',
        TRANSIT = 'bus'
    }
}
