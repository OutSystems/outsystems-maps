/// <reference path="./DrawConfig.ts" />

// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace Provider.Maps.Google.Configuration.DrawingTools {
	export class DrawMarkerConfig extends DrawConfig {
		public iconUrl: string;

		public getProviderConfig(): unknown[] {
			const provider = super.getProviderConfig();
			provider.iconUrl = this.iconUrl;

			Object.keys(provider).forEach((key) => {
				if (provider[key] === undefined) delete provider[key];
			});

			return provider;
		}
	}
}
