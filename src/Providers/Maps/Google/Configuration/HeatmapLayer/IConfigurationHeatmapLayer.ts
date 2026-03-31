// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace Provider.Maps.Google.Configuration.HeatmapLayer {
	export interface IConfigurationGoogleHeatmapLayer
		extends OSFramework.Maps.Configuration.IConfigurationHeatmapLayer {
		dissipateOnZoom: boolean;
		gradient: Array<string>;
	}
}
