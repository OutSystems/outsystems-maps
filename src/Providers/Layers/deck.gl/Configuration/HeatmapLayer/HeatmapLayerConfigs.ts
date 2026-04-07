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
			// This parameter is a tupple array with two numbers.
			// If both min and max intensity is not set (platform default=0) then the colorDomain is null.
			const colorDomainLocal: Readonly<[number, number]> | null =
				!(this.minIntensity === 0 && this.maxIntensity === 0) && this.minIntensity < this.maxIntensity
					? [this.minIntensity, this.maxIntensity]
					: null;

			return {
				// This value will be set with the uniqueId of the HeatmapLayer.
				// The property is set here, as it is required by the deck.gl
				// HeatmapLayer library.
				id: undefined,
				data: this.points,
				// This function is invoked by the deck.gl HeatmapLayer library
				// to get the position of the point. Notice that by default the
				// library uses a cartasian coordinate system [x, y , z] = [lng, lat, height].
				getPosition: (d: PointsHeatMapLayerDataType) => [d.Lng, d.Lat],
				getWeight: (d: PointsHeatMapLayerDataType) => d.Weight,
				radiusPixels: this.radius,
				colorDomain: colorDomainLocal,
				opacity: Math.max(Math.min(this.opacity, 1), 0),
				visible: true,
				pickable: true,
			};
		}
	}
}
