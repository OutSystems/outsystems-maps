// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace OSFramework.Maps.OSStructures.Directions {
    /** Return Message that is sent to Service Studio */
    export class DirectionLegs {
        public origin: OSFramework.Maps.OSStructures.OSMap.Coordinates;
        // eslint-disable-next-line @typescript-eslint/member-ordering, @typescript-eslint/no-unused-vars
        public destination: OSFramework.Maps.OSStructures.OSMap.Coordinates;
        public distance: number;
        public duration: number;
    }
}
