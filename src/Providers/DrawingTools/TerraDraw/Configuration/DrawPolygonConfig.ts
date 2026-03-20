/// <reference path="./DrawFilledShapeConfig.ts" />

// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace Provider.DrawingTools.TerraDraw.Configuration {
	/**
	 * Translates OutSystems polygon drawing tool config into TerraDraw's
	 * TerraDrawPolygonMode constructor options.
	 *
	 * Mapping:
	 *   fillColor     → styles.fillColor
	 *   fillOpacity   → styles.fillOpacity
	 *   strokeColor   → styles.outlineColor
	 *   strokeWeight  → styles.outlineWidth
	 *   strokeOpacity → styles.outlineOpacity
	 */
	export class DrawPolygonConfig extends DrawFilledShapeConfig {
		public getProviderConfig(): unknown[] {
			return {
				styles: {
					fillColor: this.fillColor ?? '#aaaaaa',
					fillOpacity: this.fillOpacity ?? 0.5,
					outlineColor: this.strokeColor ?? '#555555',
					outlineWidth: this.strokeWeight ?? 2,
					outlineOpacity: this.strokeOpacity ?? 1,
				},
			} as unknown as unknown[];
		}
	}
}
