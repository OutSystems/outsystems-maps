// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace Provider.Layers.deckgl.HeatmapLayer {
	export type data = {
		location: google.maps.LatLng;
		weight: number;
	};
	export class HeatmapLayer extends OSFramework.Maps.HeatmapLayer.AbstractHeatmapLayer<
		DeckglGoogleMapsOverlay,
		Configuration.HeatmapLayer.IConfigurationDeckglHeatmapLayer
	> {
		private _providerHeatmapLayer: DeckglHeatmapLayer | undefined;

		constructor(map: OSFramework.Maps.OSMap.IMap, HeatmapLayerId: string, configs: JSON) {
			super(map, HeatmapLayerId, new Configuration.HeatmapLayer.HeatmapLayerConfig(configs));
		}

		private _buildProviderLayer(): DeckglHeatmapLayer {
			const providerConfigs =
				this.getProviderConfig<DeckglHeatmapLayerProps<OSFramework.Maps.OSStructures.HeatmapLayer.Points>>();

			const finalConfigs = {
				...providerConfigs,
				colorRange: this._gradientColors(),
				id: this.uniqueId,
				opacity: this.config.opacity,
			} as ConstructorParameters<typeof window.deck.HeatmapLayer>[0];

			return new window.deck.HeatmapLayer(finalConfigs);
		}

		private _gradientColors(): DeckglColor[] {
			if (this.config.gradient.length === 0) return Constants.gradientHeatmapColors;
			return this.config.gradient.map((color) => {
				if (color.hex && color.hex.startsWith('#')) return this._hexToRgba(color.hex);
				return [color.red, color.green, color.blue, color.alpha];
			});
		}

		private _hexToRgba(hex: string): DeckglColor {
			return [
				parseInt(hex.slice(1, 3), 16),
				parseInt(hex.slice(3, 5), 16),
				parseInt(hex.slice(5, 7), 16),
				hex.length > 7 ? parseInt(hex.slice(7, 9), 16) : 255,
			];
		}

		/**
		 * Gets the provider HeatmapLayer instance. Enable access to the provider
		 * HeatmapLayer instance, allowing for further configuration and manipulation,
		 * outside of the OutSystemsMaps framework.
		 * @returns {DeckglHeatmapLayer | undefined} The provider HeatmapLayer instance.
		 */
		public get providerHeatmapLayer(): DeckglHeatmapLayer | undefined {
			return this._providerHeatmapLayer;
		}

		public build(): void {
			super.build();

			// Creates the provider HeatmapLayer
			this._providerHeatmapLayer = this._buildProviderLayer();

			this._provider = new window.deck.GoogleMapsOverlay({
				layers: [this._providerHeatmapLayer],
			});

			this._provider.setMap(this.map.provider);

			//this._provider.pickable = true; // Ensure pickable is true after creation

			this.finishBuild();
		}

		public changeProperty(propertyName: string, value: unknown): void {
			let propertyValue = value;
			if (
				OSFramework.Maps.Enum.OS_Config_HeatmapLayer[propertyName] ===
				OSFramework.Maps.Enum.OS_Config_HeatmapLayer.gradient
			) {
				propertyValue = JSON.parse(value as string);
			}
			super.changeProperty(propertyName, propertyValue);
			if (this.isReady) {
				// The provider does not support the change of properties via methods.
				// Instead it is required to duplicate the layer, change the configurations,
				// and then to send to the provider.
				// The provider, will perform a comparison and then affect the changed
				// values only.
				this._providerHeatmapLayer = this._buildProviderLayer();
				this._provider.setProps({
					layers: [this._providerHeatmapLayer],
				});
			}
		}

		public dispose(): void {
			if (this.isReady) {
				this._provider.setMap(null);
				this._provider.finalize();
			}
			this._provider = undefined;
			this._providerHeatmapLayer = undefined;
			super.dispose();
		}
	}
}
