/// <reference path="./BasicShapeConfig.ts" />

// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace Provider.Maps.Google.Configuration.Shape {
	export class FilledShapeConfig extends BasicShapeConfig {
		public fillColor: string;
		public fillOpacity: number;

		public getProviderConfig(): IShapeProviderConfig {
			const provider_configs = super.getProviderConfig();
			provider_configs.fillColor = this.fillColor;
			provider_configs.fillOpacity = this.fillOpacity;

			return provider_configs;
		}
	}
}
