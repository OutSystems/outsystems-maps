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

			if (geom.type === Constants.ShapeType.LineString) {
				positions = geom.coordinates as number[][];
			} else if (geom.type === Constants.ShapeType.Polygon) {
				// First ring; drop the closing duplicate point
				const ring = (geom.coordinates as number[][][])[0];
				positions = ring.slice();
			} else {
				positions = [];
			}

			return positions.map(([lng, lat]) => `${lat},${lng}`);
		}

		protected getCoordinates(feature: TerraDrawGeoJSONFeature): string {
			return JSON.stringify(
				this.extractLocations(feature).map((loc) => {
					const [lat, lng] = loc.split(',');
					return { Lat: lat, Lng: lng };
				})
			);
		}

		protected getLocation(feature: TerraDrawGeoJSONFeature): string[] {
			return this.extractLocations(feature);
		}
	}
}