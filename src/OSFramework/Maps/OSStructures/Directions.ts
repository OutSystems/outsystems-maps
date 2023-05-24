// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace OSFramework.Maps.OSStructures.Directions {
    export class Options {
        public destinationRoute: string;
        public exclude: ExcludeCriteria;
        public optimizeWaypoints: boolean;
        public originRoute: string;
        public travelMode: string;
        public waypoints: Array<string>;
    }
    /** Return Message that is sent to Service Studio */
    export class ExcludeCriteria {
        public avoidFerries: boolean;
        public avoidHighways: boolean;
        public avoidTolls: boolean;
    }
}
