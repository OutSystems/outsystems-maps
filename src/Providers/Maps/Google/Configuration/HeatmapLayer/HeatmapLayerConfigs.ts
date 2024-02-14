/// <reference path="../../../../../OSFramework/Maps/Configuration/AbstractConfiguration.ts" />

// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace Provider.Maps.Google.Configuration.HeatmapLayer {
	export class HeatmapLayerConfig
		extends OSFramework.Maps.Configuration.AbstractConfiguration
		implements OSFramework.Maps.Configuration.IConfigurationHeatmapLayer
	{
		public dissipateOnZoom: boolean;
		public gradient: Array<string>;
		public maxIntensity: number;
		public opacity: number;
		public points: Array<OSFramework.Maps.OSStructures.HeatmapLayer.Points>;
		public radius: number;

		// No need for constructor, as it is not doing anything. Left the constructor, to facilitade future usage.
		// constructor(config: JSON) {
		//     super(config);
		// }

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		public getProviderConfig(): any {
			// eslint-disable-next-line prefer-const
			let provider = {
				points: this.points,
				dissipate: this.dissipateOnZoom,
				gradient: this.gradient,
				maxIntensity: this.maxIntensity,
				opacity: this.opacity,
				radius: this.radius,
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
