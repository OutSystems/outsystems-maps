// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace Provider.Layers.deckgl.Configuration.HeatmapLayer {
	export interface IConfigurationDeckglHeatmapLayer
		extends OSFramework.Maps.Configuration.IConfigurationHeatmapLayer {
		gradient: Array<OSFramework.Maps.OSStructures.HeatmapLayer.Color>;
		id?: string;
		minIntensity: number;
	}
}
