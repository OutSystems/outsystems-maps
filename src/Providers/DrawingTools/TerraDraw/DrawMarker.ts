/// <reference path="AbstractProviderTool.ts" />

// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace Provider.DrawingTools.TerraDraw {
	export class DrawMarker extends AbstractProviderTool<Configuration.DrawMarkerConfig> {
		constructor(
			map: OSFramework.Maps.OSMap.IMap,
			drawingTools: OSFramework.Maps.DrawingTools.IDrawingTools,
			drawingToolsId: string,
			type: string,
			configs: unknown
		) {
			super(
				map,
				drawingTools,
				drawingToolsId,
				type,
				new Configuration.DrawMarkerConfig(configs)
			);
		}

		private _setOnChangeEvent(marker: OSFramework.Maps.Marker.IMarker): void {
			marker.markerEvents.addHandler(
				'dragend' as OSFramework.Maps.Event.Marker.MarkerEventType,
				() => {
					const lat = Provider.Maps.Google.Helper.Conversions.GetCoordinateValue(
						marker.getPosition().lat
					);
					const lng = Provider.Maps.Google.Helper.Conversions.GetCoordinateValue(
						marker.getPosition().lng
					);
					this.triggerOnDrawingChangeEvent(
						marker.uniqueId,
						false,
						JSON.stringify({ Lat: lat, Lng: lng }),
						`${lat},${lng}`
					);
				}
			);
		}

		protected applyStyleChange(propertyName: string, value: unknown): void {
			const draw = this.drawingTools.provider as TerraDrawInstance;
			if (
				OSFramework.Maps.Enum.OS_Config_Marker[propertyName] ===
				OSFramework.Maps.Enum.OS_Config_Marker.iconUrl
			) {
				draw.updateModeOptions(this.terraDrawModeName, { styles: { markerUrl: value } });
			}
		}

		protected get completedToolEventName(): string {
			return OSFramework.Maps.Helper.Constants.drawingMarkerCompleted;
		}

		protected createElement(
			uniqueId: string,
			feature: TerraDrawGeoJSONFeature,
			configs: Configuration.DrawMarkerConfig
		): OSFramework.Maps.Marker.IMarker {
			const [lng, lat] = (feature.geometry as GeoJSON.Point).coordinates as number[];
			const location = `${lat},${lng}`;
			const finalConfigs = { ...configs, location };

			const marker = Provider.Maps.Google.Marker.MarkerFactory.MakeMarker(
				this.map,
				uniqueId,
				OSFramework.Maps.Enum.MarkerType.Marker,
				finalConfigs
			);

			this._setOnChangeEvent(marker);
			this.map.addMarker(marker);
			return marker;
		}

		protected getCoordinates(feature: TerraDrawGeoJSONFeature): string {
			const [lng, lat] = (feature.geometry as GeoJSON.Point).coordinates as number[];
			return JSON.stringify({ Lat: lat, Lng: lng });
		}

		protected getLocation(feature: TerraDrawGeoJSONFeature): string {
			const [lng, lat] = (feature.geometry as GeoJSON.Point).coordinates as number[];
			return `${lat},${lng}`;
		}

		public changeProperty(propertyName: string, value: unknown): void {
			const propValue = OSFramework.Maps.Enum.OS_Config_Marker[propertyName];
			super.changeProperty(propertyName, value);
			if (this.drawingTools.isReady) {
				if (propValue === OSFramework.Maps.Enum.OS_Config_Marker.iconUrl) {
					this.applyStyleChange(propertyName, value);
				}
			}
		}

		public createTerraDrawMode(): TerraDrawBaseDrawMode {
			const defaultMarkerUrl =
				'https://raw.githubusercontent.com/JamesLMilner/terra-draw/refs/heads/main/assets/markers/marker-blue.png';
			return new globalThis.terraDraw.TerraDrawMarkerMode({
				styles: {
					markerUrl: this.config.iconUrl ?? defaultMarkerUrl,
					markerWidth: 32,
					markerHeight: 40,
				},
			});
		}

		public get options(): Configuration.DrawMarkerConfig {
			return this.config;
		}

		public get terraDrawModeName(): string {
			return Constants.ModeName.Marker;
		}
	}
}