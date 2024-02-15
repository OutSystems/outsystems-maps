/// <reference path="./FilledShapeConfig.ts" />

// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace Provider.Maps.Leaflet.Configuration.Shape {
	export class RectangleShapeConfig extends FilledShapeConfig {
		public bounds: string;

		public getProviderConfig(): unknown {
			const provider = super.getProviderConfig();

			// Rectangle doesn't have locations on its configurations
			// We can remove it from the provider configs
			delete provider.locations;

			return provider;
		}
	}
}
