/// <reference path="../AbstractProviderTool.ts" />
/// <reference path="Configuration/DrawMarkerConfig.ts" />

// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace Provider.DrawingTools.TerraDraw {
	export class DrawMarker extends AbstractProviderTool<Configuration.DrawMarkerConfig> {
		constructor(
			map: OSFramework.Maps.OSMap.IMap,
			drawingTools: OSFramework.Maps.DrawingTools.IDrawingTools,
			drawingToolsId: string,
			configs: JSON
		) {
			super(
				map,
				drawingTools,
				drawingToolsId,
				Constants.ModeName.Marker,
				new Configuration.DrawMarkerConfig(configs)
			);
		}

		/**
		 * Extracts a "lat,lng" string from a GeoJSON Point feature.
		 * GeoJSON coordinates are stored as [lng, lat].
		 */
		private _extractLocation(feature: TerraDrawGeoJSONFeature): string {
			const [lng, lat] = (feature.geometry as GeoJSON.Point).coordinates as number[];
			return `${lat},${lng}`;
		}

		/**
		 * Wires the marker's dragend event so that post-creation moves also fire
		 * the framework OnDrawingChange event.
		 * Provider-agnostic: IMarker.getPosition() returns ICoordenates where
		 * lat/lng may be either a number or a function (Google returns functions).
		 */
		private _setOnChangeEvent(marker: OSFramework.Maps.Marker.IMarker): void {
			marker.markerEvents.addHandler('dragend' as OSFramework.Maps.Event.Marker.MarkerEventType, () => {
				const pos = marker.getPosition();
				const lat = typeof pos.lat === 'function' ? pos.lat() : pos.lat;
				const lng = typeof pos.lng === 'function' ? pos.lng() : pos.lng;

				this.triggerOnDrawingChangeEvent(
					marker.uniqueId,
					false,
					JSON.stringify({ Lat: lat, Lng: lng }),
					`${lat},${lng}`
				);
			});
		}

		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		protected applyStyleChange(propertyName: string, value: unknown): void {
			const draw = this.drawingTools.provider as TerraDrawInstance;
			draw.updateModeOptions(this.type, this.config.getProviderConfig());
		}

		protected get completedToolEventName(): string {
			return OSFramework.Maps.Helper.Constants.drawingMarkerCompleted;
		}

		protected createElement(
			uniqueId: string,
			feature: TerraDrawGeoJSONFeature,
			configs: OSFramework.Maps.Configuration.IConfigurationMarker
		): OSFramework.Maps.Marker.IMarker {
			const location = this._extractLocation(feature);
			const finalConfigs = {
				...configs,
				location,
			} as unknown as JSON;

			const marker = OSFramework.Maps.Marker.MarkerFactory.MakeMarker(
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
			return this._extractLocation(feature);
		}

		public createTerraDrawMode(): TerraDrawBaseDrawMode {
			return new globalThis.terraDraw.TerraDrawMarkerMode(this.config.getProviderConfig());
		}

		public get options(): Configuration.DrawMarkerConfig {
			return this.config;
		}
	}
}
