// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace OSFramework.OSStructures.Directions {
    /** Return Message that is sent to Service Studio */
    export class DirectionLegs {
        public origin: OSFramework.OSStructures.OSMap.Coordinates;
        // eslint-disable-next-line @typescript-eslint/member-ordering, @typescript-eslint/no-unused-vars
        public destination: OSFramework.OSStructures.OSMap.Coordinates;
        public distance: number;
        public duration: number;
    }
}
