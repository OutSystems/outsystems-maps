// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace Provider.Layers.deckgl.Configuration.HeatmapLayer {
	type PointsHeatMapLayerDataType = OSFramework.Maps.OSStructures.HeatmapLayer.Points;

	export class HeatmapLayerConfig
		extends OSFramework.Maps.Configuration.AbstractConfiguration
		implements IConfigurationDeckglHeatmapLayer
	{
		public gradient: Array<OSFramework.Maps.OSStructures.HeatmapLayer.Color>;
		public maxIntensity: number;
		public minIntensity: number;
		public opacity: number;
		public points: Array<PointsHeatMapLayerDataType>;
		public radius: number;

		public getProviderConfig(): DeckglHeatmapLayerProps<PointsHeatMapLayerDataType> {
			const colorDomainLocal: Readonly<[number, number]> | null =
				!(this.minIntensity === 0 && this.maxIntensity === 0) && this.minIntensity < this.maxIntensity
					? [this.minIntensity, this.maxIntensity]
					: null;

			return {
				id: undefined,
				data: this.points,
				getPosition: (d: PointsHeatMapLayerDataType) => [d.Lng, d.Lat],
				getWeight: (d: PointsHeatMapLayerDataType) => d.Weight,
				radiusPixels: this.radius,
				colorDomain: colorDomainLocal,
				opacity: this.opacity > 1 ? 1 : this.opacity < 0 ? 0 : this.opacity,
				visible: true,
				pickable: true,
			};
		}
	}
}
