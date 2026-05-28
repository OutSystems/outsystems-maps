/// <reference path="../../../../OSFramework/Maps/FileLayer/AbstractFileLayer.ts" />

namespace Provider.Layers.deckgl.FileLayer {
	export class FileLayer extends OSFramework.Maps.FileLayer.AbstractFileLayer<
		DeckglGoogleMapsOverlay,
		Configuration.FileLayer.FileLayerConfig
	> {
		// Cached default fallback icon image; loaded once and reused across atlas rebuilds to avoid redundant network requests.
		private _defaultImg: HTMLImageElement | null = null;
		// Parsed GeoJSON feature collection produced by the KML loader; retained so the layer can be recreated without re-fetching.
		private _geoJsonData: DeckglGeoJsonLayerData | undefined;
		// Active deck.gl GeoJsonLayer instance currently attached to the overlay.
		private _geoJsonLayer: DeckglGeoJsonLayer | undefined;
		// Offscreen canvas that packs all icon images into a single sprite sheet for deck.gl rendering.
		private _iconAtlas: HTMLCanvasElement | undefined;
		// Maps each icon URL (and the default key) to its pixel rect within _iconAtlas.
		private _iconMapping: Record<string, IIconMapping> | undefined;

		constructor(map: OSFramework.Maps.OSMap.IMap, fileLayerId: string, configs: JSON) {
			super(map, fileLayerId, new Configuration.FileLayer.FileLayerConfig(configs));
		}

		/**
		 * Pre-loads all icon images referenced by the KML features and composites
		 * them into an offscreen canvas atlas so deck.gl never fetches icons itself.
		 * deck.gl's bundled loaders.gl/core has no ImageLoader registered, so any
		 * URL-based getIcon would fail at render time.
		 */
		private async _buildIconAtlas(): Promise<void> {
			const externalUrls = new Set<string>();
			const features = (this._geoJsonData as unknown as GeoJSON.FeatureCollection)?.features ?? [];

			// Add all external links to a list of URLs to pre-load, skipping duplicates.
			// Icons are specified in the KML as a property on each feature, so we need to
			// inspect all features to find all icons.
			features.forEach((f) => {
				const icon = (f.properties as { icon?: string } | undefined)?.icon?.trim();
				if (icon) externalUrls.add(icon);
			});

			// Let's load the default icon only once.
			this._defaultImg ??= await this._tryLoad(Constants.DEFAULT_ICON_URL, false);

			// External icon URLs use crossOrigin='anonymous'. If CORS is denied the
			// icon is omitted from the atlas; affected features fall back to the default.
			const externalResults = await Promise.all(
				[...externalUrls].map(async (url) => ({ url, img: await this._tryLoad(url) }))
			);

			const entries: Array<{ img: HTMLImageElement; key: string }> = [];

			this._defaultImg && entries.push({ key: Constants.DEFAULT_ICON_KEY, img: this._defaultImg });

			// Add all successfully loaded external icons to the entries list for atlas composition.
			externalResults.forEach(({ url, img }) => {
				img && entries.push({ key: url, img });
			});

			// Calculate the number of columns and rows needed to fit all icons in a grid layout within the atlas.
			const cols = Math.max(1, Math.ceil(Math.sqrt(entries.length)));
			const rows = Math.ceil(entries.length / cols);

			// The atlas is a grid of cells, each cell can fit one icon at max dimensions ICON_CELL_SIZE x ICON_CELL_SIZE.
			const canvas = document.createElement('canvas');
			canvas.width = cols * Constants.ICON_CELL_SIZE;
			canvas.height = rows * Constants.ICON_CELL_SIZE;

			// We can assert the context is not null because we're in a browser environment and the canvas API is supported.
			const canvasContext = canvas.getContext('2d')!;

			const mapping: Record<string, IIconMapping> = {};

			// Draw each icon into the correct position in the atlas and record its mapping for deck.gl.
			entries.forEach(({ key, img }, i) => {
				// Calculate the position of the icon in the atlas grid.
				const x = (i % cols) * Constants.ICON_CELL_SIZE;
				const y = Math.floor(i / cols) * Constants.ICON_CELL_SIZE;

				// Draw the icon into the atlas cell.
				canvasContext.drawImage(img, x, y, Constants.ICON_CELL_SIZE, Constants.ICON_CELL_SIZE);

				// Record the mapping for this icon URL to its position and size in the atlas.
				mapping[key] = {
					x,
					y,
					width: Constants.ICON_CELL_SIZE,
					height: Constants.ICON_CELL_SIZE,
					anchorX: Constants.ICON_CELL_SIZE / 2,
					anchorY: Constants.ICON_CELL_SIZE,
				};
			});

			// Store the completed icon atlas and mapping for use by the deck.gl layer.
			this._iconAtlas = canvas;
			this._iconMapping = mapping;
		}

		/**
		 * Constructs a deck.gl GeoJsonLayer wired to the current GeoJSON data, icon atlas, style
		 * accessors, and an optional click handler based on the current configuration and registered events.
		 */
		private _buildProviderLayer(): DeckglGeoJsonLayer {
			const hasClickHandlers = this.fileLayerEvents.hasHandlers(
				OSFramework.Maps.Event.FileLayer.FileLayersEventType.OnClick
			);

			return new window.deck.GeoJsonLayer({
				id: this.uniqueId,
				data: this._geoJsonData as DeckglGeoJsonLayerData,
				pickable: !this.config.suppressPopups,
				pointType: 'icon',
				iconAtlas: this._iconAtlas,
				iconMapping: this._iconMapping,
				iconSizeUnits: 'pixels',
				getIconSize: 32,
				// The getIcon callback determines which icon to use for each feature based on its properties.
				// Uses the icons previously stored in the icon atlas.
				getIcon: (feature: GeoJSON.Feature) => {
					const url = (feature.properties as { icon?: string } | undefined)?.icon?.trim() ?? '';
					return this._iconMapping?.[url] !== undefined ? url : Constants.DEFAULT_ICON_KEY;
				},
				stroked: true,
				filled: true,
				lineWidthUnits: 'pixels',
				// Gets the line width as defined in the style attribute or a default value.
				getLineWidth: (feature: GeoJSON.Feature) => {
					const props = feature.properties as Record<string, unknown> | null;
					return (props?.['stroke-width'] as number | undefined) ?? 2;
				},
				// Gets the line color as defined in the styles attribute, or a default value.
				getLineColor: (feature: GeoJSON.Feature) => {
					return this._colorFromProperties(
						feature.properties as Record<string, unknown> | null,
						'stroke',
						'stroke-opacity',
						Constants.DEFAULT_STROKE_COLOR
					);
				},
				// Gets the fill color as defined in the styles attribute, or a default value.
				getFillColor: (feature: GeoJSON.Feature) => {
					return this._colorFromProperties(
						feature.properties as Record<string, unknown> | null,
						'fill',
						'fill-opacity',
						Constants.DEFAULT_FILL_COLOR
					);
				},
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

		/**
		 * Helper method to extract RGBA color from feature properties, with fallbacks to default colors.
		 * Checks for hex color strings and corresponding opacity values, returning a color array suitable for deck.gl.
		 */
		private _colorFromProperties(
			props: Record<string, unknown> | null,
			colorKey: string,
			opacityKey: string,
			fallback: [number, number, number, number]
		): [number, number, number, number] {
			const hex = props?.[colorKey] as string | undefined;
			if (hex?.startsWith('#') && hex.length >= 7) {
				const [r, g, b] = Helper.HexToRgba(hex);
				const opacity = (props?.[opacityKey] as number | undefined) ?? 1;
				return [r, g, b, Math.round(opacity * 255)];
			}
			return fallback;
		}

		// Instantiates a fresh provider layer from the current data and atlas, then pushes it onto the deck.gl overlay.
		private _createFileLayer(): void {
			this._geoJsonLayer = this._buildProviderLayer();
			if (!this._provider) {
				this._provider = new window.deck.GoogleMapsOverlay({
					layers: [this._geoJsonLayer],
				});
				this._provider.setMap(this.map.provider);
			} else {
				this._provider.setProps({ layers: [this._geoJsonLayer] });
			}
		}

		// Detaches the overlay from the Google Map, finalizes deck.gl resources, and resets all layer state to undefined.
		private _disposeLayer(): void {
			if (this.isReady && this._provider) {
				this._provider.setMap(null);
				this._provider.finalize();
			}
			this._provider = undefined;
			this._geoJsonLayer = undefined;
			this._geoJsonData = undefined;
			this._iconAtlas = undefined;
			this._iconMapping = undefined;
		}

		// Walks all feature coordinates to build a LatLngBounds, then pans and zooms the Google Map to fit all features.
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

		/**
		 * Full load pipeline: fetches and parses the KML at layerUrl, builds the icon atlas,
		 * creates the deck.gl layer, attaches it to the map, optionally fits the viewport, and
		 * triggers finishBuild. Any failure is surfaced through the map's OnError event.
		 */
		private async _loadAndBuild(triggerFinishBuild = true): Promise<void> {
			try {
				this._geoJsonData = (await window.loaders.load(
					this.config.layerUrl,
					window.loaders.KMLLoader
				)) as DeckglGeoJsonLayerData;

				await this._buildIconAtlas();

				this._createFileLayer();

				if (!this.config.preserveViewport) {
					this._fitBounds();
				}

				if (triggerFinishBuild) {
					this.finishBuild();
				}
			} catch (e: unknown) {
				this.map.mapEvents.trigger(
					OSFramework.Maps.Event.OSMap.MapEventType.OnError,
					this.map,
					OSFramework.Maps.Enum.ErrorCodes.LIB_FailedLoadingFileLayer,
					(e as Error).message
				);
			}
		}

		// Loads an image from a URL; resolves to null on a CORS failure or load error so callers can fall back gracefully.
		private _tryLoad(url: string, withCors = true): Promise<HTMLImageElement | null> {
			return new Promise((resolve) => {
				const img = new Image();
				if (withCors) img.crossOrigin = 'anonymous';
				img.onload = () => resolve(img);
				img.onerror = () => resolve(null);
				img.src = url;
			});
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
						this._disposeLayer();
						this._loadAndBuild(false);
						break;
					case OSFramework.Maps.Enum.OS_Config_FileLayer.suppressPopups:
						this._createFileLayer();
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
			this._disposeLayer();
			super.dispose();
		}

		public refreshProviderEvents(): void {
			if (this.isReady) {
				this._createFileLayer();
			}
		}
	}
}
