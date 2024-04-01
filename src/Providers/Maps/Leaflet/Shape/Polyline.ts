/// <reference path="AbstractPolyshape.ts" />

// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace Provider.Maps.Leaflet.Shape {
	export class Polyline extends AbstractPolyshape<Configuration.Shape.BasicShapeConfig, L.Polyline> {
		constructor(
			map: OSFramework.Maps.OSMap.IMap,
			shapeId: string,
			type: OSFramework.Maps.Enum.ShapeType,
			configs: OSFramework.Maps.Configuration.IConfigurationShape
		) {
			super(map, shapeId, type, new Configuration.Shape.BasicShapeConfig(configs));
		}

		protected get invalidShapeLocationErrorCode(): OSFramework.Maps.Enum.ErrorCodes {
			return OSFramework.Maps.Enum.ErrorCodes.CFG_InvalidPolylineShapeLocations;
		}

		protected get providerObjectPath(): L.LatLng[] | L.LatLng[][] | L.LatLng[][][] {
			return this.provider.getLatLngs();
		}

		public get providerBounds(): L.LatLngBounds {
			return this.provider.getBounds();
		}

		public get shapeTag(): string {
			return OSFramework.Maps.Helper.Constants.shapePolylineTag;
		}

		protected createProvider(path: Array<OSFramework.Maps.OSStructures.OSMap.Coordinates>): L.Polyline {
			return new L.Polyline(path as L.LatLngExpression[], this.getProviderConfig());
		}

		protected getShapeCoordinates(): OSFramework.Maps.OSStructures.OSMap.PolylineCoordinates {
			const locations = (this.providerObjectPath as Array<L.LatLng>).map((elm) => `${elm.lat},${elm.lng}`);
			const coordinates = (this.providerObjectPath as Array<L.LatLng>).map((elm) => {
				return {
					Lat: elm.lat,
					Lng: elm.lng,
				};
			});
			return {
				location: locations,
				coordinates: coordinates,
			};
		}
	}
}
