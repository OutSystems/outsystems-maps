/// <reference path="./DrawConfig.ts" />

// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace Provider.DrawingTools.TerraDraw.Configuration {
	/**
	 * Translates OutSystems marker drawing tool config into TerraDraw's
	 * TerraDrawPointMode constructor options.
	 *
	 * iconUrl is stored so it can be forwarded to the OS marker created on
	 * completion. The TerraDraw temporary overlay always renders as a styled dot
	 * — icon URLs are not supported by TerraDrawPointMode.
	 */
	export class DrawMarkerConfig extends DrawConfig {
		public iconUrl: string;

		public getProviderConfig(): unknown[] {
			return {
				styles: {
					markerUrl: this.iconUrl ?? '',
				},
			} as unknown as unknown[];
		}
	}
}
