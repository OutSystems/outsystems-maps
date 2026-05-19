/// <reference path="../../../../OSFramework/Maps/FileLayer/AbstractFileLayer.ts" />

namespace Provider.Layers.deckgl.FileLayer {
	export class FileLayer extends OSFramework.Maps.FileLayer.AbstractFileLayer<
		DeckglGoogleMapsOverlay,
		Configuration.FileLayer.FileLayerConfig
	> {
		private _geoJsonData: DeckglGeoJsonLayerData | undefined;
		private _geoJsonLayer: DeckglGeoJsonLayer | undefined;

		constructor(map: OSFramework.Maps.OSMap.IMap, fileLayerId: string, configs: JSON) {
			super(map, fileLayerId, new Configuration.FileLayer.FileLayerConfig(configs));
		}

		private _buildProviderLayer(): DeckglGeoJsonLayer {
			const hasClickHandlers = this.fileLayerEvents.hasHandlers(
				OSFramework.Maps.Event.FileLayer.FileLayersEventType.OnClick
			);

			return new window.deck.GeoJsonLayer({
				id: this.uniqueId,
				data: this._geoJsonData as DeckglGeoJsonLayerData,
				pickable: !this.config.suppressPopups,
				pointType: 'icon',
				iconSizeUnits: 'pixels',
				getIconSize: 32,
				getIcon: (feature: GeoJSON.Feature) => {
					const url =
						(feature.properties as { icon?: string } | undefined)?.icon?.trim() ||
						'https://maps.google.com/mapfiles/kml/pushpin/ylw-pushpin.png';
					return {
						url,
						width: 32,
						height: 32,
						anchorX: 16,
						anchorY: 32,
					};
				},
				stroked: true,
				filled: true,
				lineWidthUnits: 'pixels',
				getLineWidth: 2,
				getLineColor: [66, 133, 244, 255],
				getFillColor: [66, 133, 244, 60],
				onClick:
					!this.config.suppressPopups && hasClickHandlers
						? (info) => {
								const flParams: OSFramework.Maps.FileLayer.IFileLayerEventParams = {
									coordinates: JSON.stringify({
										Lat: info.coordinate?.[1],
										Lng: info.coordinate?.[0],
									}),
									featureData: JSON.stringify(
										(info.object as { properties?: unknown })?.properties ?? {}
									),
								};
								this.fileLayerEvents.trigger(
									OSFramework.Maps.Event.FileLayer.FileLayersEventType.OnClick,
									undefined,
									flParams
								);
							}
						: undefined,
			});
		}

		private _fitBounds(): void {
			const collection = this._geoJsonData as GeoJSON.FeatureCollection | undefined;
			if (!collection?.features?.length) return;

			const bounds = new google.maps.LatLngBounds();

			const extendWithCoords = (coords: unknown): void => {
				if (!Array.isArray(coords)) return;
				if (typeof coords[0] === 'number') {
					bounds.extend({ lat: coords[1] as number, lng: coords[0] as number });
				} else {
					(coords as unknown[]).forEach(extendWithCoords);
				}
			};

			collection.features.forEach((feature) => {
				extendWithCoords((feature.geometry as { coordinates?: unknown })?.coordinates);
			});

			if (!bounds.isEmpty()) {
				(this.map.provider as google.maps.Map).fitBounds(bounds);
			}
		}

		private async _loadAndBuild(triggerFinishBuild = true): Promise<void> {
			try {
				this._geoJsonData = (await window.loaders.load(
					this.config.layerUrl,
					window.loaders.KMLLoader
				)) as DeckglGeoJsonLayerData;
				this._geoJsonLayer = this._buildProviderLayer();
				this._provider = new window.deck.GoogleMapsOverlay({
					layers: [this._geoJsonLayer],
				});
				this._provider.setMap(this.map.provider);

				if (!this.config.preserveViewport) {
					this._fitBounds();
				}

				if (triggerFinishBuild) {
					this.finishBuild();
				}
			} catch (e) {
				this.map.mapEvents.trigger(
					OSFramework.Maps.Event.OSMap.MapEventType.OnError,
					this.map,
					OSFramework.Maps.Enum.ErrorCodes.LIB_FailedLoadingFileLayer,
					(e as Error).message
				);
			}
		}

		private _setFileLayerEvents(): void {
			this._geoJsonLayer = this._buildProviderLayer();
			this._provider.setProps({ layers: [this._geoJsonLayer] });
		}

		public build(): void {
			super.build();
			this._loadAndBuild();
		}

		public changeProperty(propertyName: string, value: unknown): void {
			const propValue = OSFramework.Maps.Enum.OS_Config_FileLayer[propertyName];
			super.changeProperty(propertyName, value);

			if (this.isReady) {
				switch (propValue) {
					case OSFramework.Maps.Enum.OS_Config_FileLayer.layerUrl:
						this._provider.setMap(null);
						this._provider.finalize();
						this._provider = undefined;
						this._geoJsonLayer = undefined;
						this._geoJsonData = undefined;
						this._loadAndBuild(false);
						break;
					case OSFramework.Maps.Enum.OS_Config_FileLayer.suppressPopups:
						this._setFileLayerEvents();
						break;
					case OSFramework.Maps.Enum.OS_Config_FileLayer.preserveViewport:
						if (!(value as boolean)) {
							this._fitBounds();
						}
						break;
				}
			}
		}

		public dispose(): void {
			if (this.isReady) {
				this._provider.setMap(null);
				this._provider.finalize();
			}
			this._provider = undefined;
			this._geoJsonLayer = undefined;
			this._geoJsonData = undefined;
			super.dispose();
		}

		public refreshProviderEvents(): void {
			if (this.isReady) {
				this._setFileLayerEvents();
			}
		}
	}
}
