/// <reference path="./DrawBasicShapeConfig.ts" />

// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace Provider.DrawingTools.TerraDraw.Configuration {
	/**
	 * Translates OutSystems polyline drawing tool config into TerraDraw's
	 * TerraDrawLineStringMode constructor options.
	 *
	 * Mapping:
	 *   strokeColor  → styles.lineStringColor
	 *   strokeWeight → styles.lineStringWidth
	 *   strokeOpacity → styles.lineStringOpacity
	 */
	export class DrawPolylineConfig extends DrawBasicShapeConfig {
		public getProviderConfig(): unknown {
			return {
				styles: {
					lineStringColor: this.strokeColor ?? '#555555',
					lineStringWidth: this.strokeWeight ?? 2,
					lineStringOpacity: this.strokeOpacity ?? 1,
				},
			};
		}
	}
}
