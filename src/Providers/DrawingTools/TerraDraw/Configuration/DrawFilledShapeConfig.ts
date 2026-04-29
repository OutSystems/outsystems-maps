/// <reference path="./DrawBasicShapeConfig.ts" />

// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace Provider.DrawingTools.TerraDraw.Configuration {
	export class DrawFilledShapeConfig extends DrawBasicShapeConfig {
		public fillColor: string;
		public fillOpacity: number;

		/**
		 * Translates OutSystems polygon/rectangle drawing tool config into TerraDraw's
		 * TerraDrawPolygonMode/TerraDrawRectangleMode/TerraCircleMode constructor options.
		 *
		 * Mapping:
		 *   fillColor     → styles.fillColor
		 *   fillOpacity   → styles.fillOpacity
		 *   strokeColor   → styles.outlineColor
		 *   strokeWeight  → styles.outlineWidth
		 *   strokeOpacity → styles.outlineOpacity
		 */
		public getProviderConfig(): unknown {
			return {
				styles: {
					fillColor: this.fillColor ?? '#aaaaaa',
					fillOpacity: this.fillOpacity ?? 0.5,
					outlineColor: this.strokeColor ?? '#555555',
					outlineWidth: this.strokeWeight ?? 2,
					outlineOpacity: this.strokeOpacity ?? 1,
				},
			};
		}
	}
}
