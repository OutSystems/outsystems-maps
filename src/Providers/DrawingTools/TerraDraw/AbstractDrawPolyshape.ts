/// <reference path="../AbstractDrawShape.ts" />

// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace Provider.DrawingTools.TerraDraw {
	export abstract class AbstractDrawPolyshape<
		T extends Configuration.DrawBasicShapeConfig,
	> extends AbstractDrawShape<T> {
		/**
		 * Extracts location strings ("{lat},{lng}") from a GeoJSON LineString or Polygon ring.
		 * For a Polygon the first ring (outer boundary) is used.
		 */
		protected extractLocations(feature: TerraDrawGeoJSONFeature): string[] {
			const geom = feature.geometry;
			let positions: number[][];
			const geomType = geom.type.toLocaleLowerCase();

			if (geomType === Constants.ModeName.LineString) {
				positions = geom.coordinates as number[][];
			} else if (geomType === Constants.ModeName.Polygon) {
				// First ring; drop the closing duplicate point
				const ring = (geom.coordinates as number[][][])[0];
				positions = ring.slice(0, -1);
			} else {
				positions = [];
			}

			return positions.map(([lng, lat]) => `${lat},${lng}`);
		}

		protected getCoordinates(feature: TerraDrawGeoJSONFeature): string {
			return JSON.stringify(
				this.extractLocations(feature).map((loc) => {
					const [lat, lng] = loc.split(',');
					return { Lat: Number(lat), Lng: Number(lng) };
				})
			);
		}

		protected getLocation(feature: TerraDrawGeoJSONFeature): string | string[] {
			return JSON.stringify(this.extractLocations(feature));
		}
	}
}
