/// <reference path="../../../../../OSFramework/Maps/Configuration/AbstractConfiguration.ts" />

// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace Provider.Maps.Google.Configuration.FileLayer {
	export class FileLayerConfig
		extends OSFramework.Maps.Configuration.AbstractConfiguration
		implements OSFramework.Maps.Configuration.IConfigurationFileLayer
	{
		public layerUrl: string;
		public preserveViewport: boolean;
		public suppressPopups: boolean;

		public getProviderConfig(): unknown {
			// eslint-disable-next-line prefer-const
			let provider = {
				clickable: true,
				url: this.layerUrl,
				preserveViewport: this.preserveViewport,
				suppressInfoWindows: this.suppressPopups,
			};

			//Cleanning undefined properties
			Object.keys(provider).forEach((key) => {
				if (provider[key] === undefined) {
					delete provider[key];
				}
			});

			return provider;
		}
	}
}
