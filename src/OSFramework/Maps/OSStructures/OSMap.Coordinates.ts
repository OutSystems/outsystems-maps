// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace OSFramework.Maps.OSStructures.OSMap {
	export class Coordinates {
		public lat: number | (() => number);
		public lng: number | (() => number);
	}

	// eslint-disable-next-line @typescript-eslint/naming-convention
	export class OSCoordinates {
		public Lat: number;
		public Lng: number;

		constructor(lat: number, lng: number) {
			this.Lat = lat;
			this.Lng = lng;
		}
	}

	export type PolylineCoordinates = {
		coordinates: Array<OSCoordinates>;
		location: Array<string>;
	};

	export type CircleCoordinates = {
		coordinates: OSCoordinates;
		location: {
			location: string;
			radius: number;
		};
	};

	export type RectangleCoordinates = {
		coordinates: Bounds;
		location: Bounds;
	};

	export type OSShapeCoordinates =
		| PolylineCoordinates // Polyline and Polygon type
		| CircleCoordinates
		| RectangleCoordinates;
}
