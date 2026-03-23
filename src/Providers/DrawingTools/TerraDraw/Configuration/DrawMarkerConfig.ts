/// <reference path="./DrawConfig.ts" />

// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace Provider.DrawingTools.TerraDraw.Configuration {
	/**
	 * Translates OutSystems marker drawing tool config into TerraDraw's
	 * TerraDrawMarkerMode constructor options.
	 *
	 * iconUrl is stored so it can be forwarded to the OS marker created on
	 * completion.
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
