// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace Provider.Maps.Google.Configuration.MarkerClusterer {
	export class MarkerClustererConfig
		extends OSFramework.Maps.Configuration.AbstractConfiguration
		implements OSFramework.Maps.Configuration.IConfigurationMarkerClusterer
	{
		public clusterClass: string;
		public markerClustererActive: boolean;
		public markerClustererMaxZoom: number;
		public markerClustererMinClusterSize: number;
		public markerClustererZoomOnClick: boolean;

		// constructor(
		//     config: Configuration.MarkerClusterer.MarkerClustererConfig
		// ) {
		//     super(config);
		// }

		public getProviderConfig(): GoogleMapsMarkerClustererOptions {
			return {};
		}
	}
}
