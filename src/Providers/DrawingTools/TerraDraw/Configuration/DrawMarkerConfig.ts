/// <reference path="./DrawConfig.ts" />

// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace Provider.DrawingTools.TerraDraw.Configuration {
	/**
	 * Translates OutSystems marker drawing tool config into TerraDraw's
	 * TerraDrawMarkerMode constructor options.
	 *
	 * iconUrl drives both the TerraDraw in-progress overlay (via markerUrl) and
	 * the permanent OS marker created on completion. If no iconUrl is supplied,
	 * TerraDrawMarkerMode falls back to a plain styled dot for the overlay while
	 * the OS marker will use its own default icon.
	 */
	export class DrawMarkerConfig extends DrawConfig {
		public iconUrl: string;

		public getProviderConfig(): unknown {
			return {
				styles: {
					markerUrl: this.iconUrl ?? '',
				},
			};
		}
	}
}
