// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace Provider.DrawingTools.TerraDraw.Tools {
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
			const geomType = geom.type.toLowerCase();

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

		/**
		 * Returns a JSON array of {Lat, Lng} objects for the framework OnDrawingChange event.
		 * PascalCase keys are required by the OutSystems serialization contract.
		 */
		protected getCoordinates(feature: TerraDrawGeoJSONFeature): string {
			return JSON.stringify(
				this.extractLocations(feature).map((loc) => {
					const [lat, lng] = loc.split(',');
					return { Lat: Number(lat), Lng: Number(lng) };
				})
			);
		}

		/**
		 * Returns a JSON-encoded string array of "lat,lng" pairs suitable for
		 * the OutSystems Shape block's Locations input parameter.
		 */
		protected getLocation(feature: TerraDrawGeoJSONFeature): string | string[] {
			return JSON.stringify(this.extractLocations(feature));
		}
	}
}
