namespace OSFramework.Feature {
    export interface ICenter {
        /**
         * Get the coordinates of the center position of the Map
         */
        getCenter(): OSStructures.OSMap.Coordinates;
        /**
         * Converts the location into coordinates before setting the new center position of the Map
         * @param location Can be an adress or coordinates
         */
        updateCenter(location: string | OSFramework.OSStructures.OSMap.Coordinates): void;
    }
}
