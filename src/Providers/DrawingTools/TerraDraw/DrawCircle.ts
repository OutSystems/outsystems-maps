/// <reference path="AbstractDrawShape.ts" />

// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace Provider.DrawingTools.TerraDraw {
	export class DrawCircle extends AbstractDrawShape<Configuration.DrawFilledShapeConfig> {
		constructor(
			map: OSFramework.Maps.OSMap.IMap,
			drawingTools: OSFramework.Maps.DrawingTools.IDrawingTools,
			drawingToolsId: string,
			type: string,
			configs: JSON
		) {
			super(
				map,
				drawingTools,
				drawingToolsId,
				type,
				new Configuration.DrawFilledShapeConfig(configs)
			);
		}

		/**
		 * Computes the geodetic center of the circle polygon.
		 * TerraDraw stores circles as polygon approximations; the center is the
		 * average of all ring coordinates (accurate when vertices are evenly spaced).
		 */
		private _computeCenter(feature: TerraDrawGeoJSONFeature): { lat: number; lng: number } {
			const ring = ((feature.geometry as GeoJSON.Polygon).coordinates[0] as number[][]).slice(0, -1);
			const lat = ring.reduce((sum, p) => sum + p[1], 0) / ring.length;
			const lng = ring.reduce((sum, p) => sum + p[0], 0) / ring.length;
			return { lat, lng };
		}

		/**
		 * Computes the radius (metres) using the Haversine formula between the
		 * computed center and the first vertex of the polygon ring.
		 */
		private _computeRadius(feature: TerraDrawGeoJSONFeature, center: { lat: number; lng: number }): number {
			const firstPoint = ((feature.geometry as GeoJSON.Polygon).coordinates[0] as number[][])[0];
			const lat2 = firstPoint[1];
			const lng2 = firstPoint[0];

			const R = 6371000; // Earth radius in metres
			const φ1 = (center.lat * Math.PI) / 180;
			const φ2 = (lat2 * Math.PI) / 180;
			const Δφ = ((lat2 - center.lat) * Math.PI) / 180;
			const Δλ = ((lng2 - center.lng) * Math.PI) / 180;

			const a =
				Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
				Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

			return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
		}

		protected applyStyleChange(propertyName: string, value: unknown): void {
			const draw = this.drawingTools.provider as TerraDrawInstance;
			const propValue = OSFramework.Maps.Enum.OS_Config_Shape[propertyName];
			const styleMap: Record<number, Record<string, unknown>> = {
				[OSFramework.Maps.Enum.OS_Config_Shape.fillColor]: { fillColor: value },
				[OSFramework.Maps.Enum.OS_Config_Shape.fillOpacity]: { fillOpacity: value },
				[OSFramework.Maps.Enum.OS_Config_Shape.strokeColor]: { outlineColor: value },
				[OSFramework.Maps.Enum.OS_Config_Shape.strokeWeight]: { outlineWidth: value },
				[OSFramework.Maps.Enum.OS_Config_Shape.strokeOpacity]: { outlineOpacity: value },
			};
			if (styleMap[propValue]) {
				draw.updateModeOptions(this.terraDrawModeName, { styles: styleMap[propValue] });
			}
		}

		protected get completedToolEventName(): string {
			return OSFramework.Maps.Helper.Constants.drawingCircleCompleted;
		}

		protected createElement(
			uniqueId: string,
			feature: TerraDrawGeoJSONFeature,
			configs: Configuration.DrawFilledShapeConfig
		): OSFramework.Maps.Shape.IShape {
			const center = this._computeCenter(feature);
			const radius = this._computeRadius(feature, center);

			const finalConfigs = {
				...configs,
				center: `${center.lat},${center.lng}`,
				radius,
			};

			return super.createShapeElement(uniqueId, OSFramework.Maps.Enum.ShapeType.Circle, finalConfigs);
		}

		protected getCoordinates(feature: TerraDrawGeoJSONFeature): string {
			const center = this._computeCenter(feature);
			return JSON.stringify({ Lat: center.lat, Lng: center.lng });
		}

		protected getLocation(feature: TerraDrawGeoJSONFeature): string {
			const center = this._computeCenter(feature);
			const radius = this._computeRadius(feature, center);
			return JSON.stringify({ location: `${center.lat},${center.lng}`, radius });
		}

		public createTerraDrawMode(): TerraDrawBaseDrawMode {
			return new globalThis.terraDraw.TerraDrawCircleMode({
				styles: {
					fillColor: (this.config.fillColor ?? '#aaaaaa') as TerraDrawHexColor,
					fillOpacity: this.config.fillOpacity ?? 0.5,
					outlineColor: (this.config.strokeColor ?? '#555555') as TerraDrawHexColor,
					outlineWidth: this.config.strokeWeight ?? 2,
					outlineOpacity: this.config.strokeOpacity ?? 1,
				},
			});
		}

		public get options(): Provider.Maps.Google.Configuration.DrawingTools.DrawFilledShapeConfig {
			return this.config;
		}

		public get terraDrawModeName(): string {
			return Constants.ModeName.Circle;
		}
	}
}