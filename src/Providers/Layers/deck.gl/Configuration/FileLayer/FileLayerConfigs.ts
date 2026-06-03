/// <reference path="../../../../../OSFramework/Maps/Configuration/AbstractConfiguration.ts" />

namespace Provider.Layers.deckgl.Configuration.FileLayer {
	export class FileLayerConfig
		extends OSFramework.Maps.Configuration.AbstractConfiguration
		implements OSFramework.Maps.Configuration.IConfigurationFileLayer
	{
		public layerUrl: string;
		public preserveViewport: boolean;
		public suppressPopups: boolean;

		public getProviderConfig(): unknown {
			return {
				layerUrl: this.layerUrl,
				preserveViewport: this.preserveViewport,
				suppressPopups: this.suppressPopups,
			};
		}
	}
}
