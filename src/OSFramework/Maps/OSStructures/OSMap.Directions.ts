// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace OSFramework.Maps.OSStructures.Directions {
	/** Return Message that is sent to Service Studio */
	export class DirectionLegs {
		public destination: OSMap.Coordinates;
		public distance: number;
		public duration: number;
		public origin: OSMap.Coordinates;
	}
}
