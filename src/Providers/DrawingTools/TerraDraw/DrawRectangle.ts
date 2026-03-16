/// <reference path="AbstractDrawShape.ts" />

// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace Provider.DrawingTools.TerraDraw {
	export class DrawRectangle extends AbstractDrawShape<Configuration.DrawFilledShapeConfig> {
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
		 * Derives axis-aligned bounds from the rectangle polygon's four corner vertices.
		 * TerraDraw stores rectangles as closed Polygons with 5 points (4 corners + closing).
		 */
		private _extractBounds(feature: TerraDrawGeoJSONFeature): OSFramework.Maps.OSStructures.OSMap.BoundsString {
			const ring = ((feature.geometry as GeoJSON.Polygon).coordinates[0] as number[][]).slice(0, -1);
			const lats = ring.map((p) => p[1]);
			const lngs = ring.map((p) => p[0]);
			return {
				north: String(Math.max(...lats)),
				south: String(Math.min(...lats)),
				east: String(Math.max(...lngs)),
				west: String(Math.min(...lngs)),
			};
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
			return OSFramework.Maps.Helper.Constants.drawingRectangleCompleted;
		}

		protected createElement(
			uniqueId: string,
			feature: TerraDrawGeoJSONFeature,
			configs: Provider.Maps.Google.Configuration.DrawingTools.DrawFilledShapeConfig
		): OSFramework.Maps.Shape.IShape {
			const bounds = this._extractBounds(feature);
			const finalConfigs = { ...configs, bounds: JSON.stringify(bounds) };
			return super.createShapeElement(uniqueId, OSFramework.Maps.Enum.ShapeType.Rectangle, finalConfigs);
		}

		protected getCoordinates(feature: TerraDrawGeoJSONFeature): string {
			return JSON.stringify(this._extractBounds(feature));
		}

		protected getLocation(feature: TerraDrawGeoJSONFeature): string {
			return JSON.stringify(this._extractBounds(feature));
		}

		public createTerraDrawMode(): TerraDrawBaseDrawMode {
			return new globalThis.terraDraw.TerraDrawRectangleMode({
				styles: {
					fillColor: (this.config.fillColor ?? '#aaaaaa') as TerraDrawHexColor,
					fillOpacity: this.config.fillOpacity ?? 0.5,
					outlineColor: (this.config.strokeColor ?? '#555555') as TerraDrawHexColor,
					outlineWidth: this.config.strokeWeight ?? 2,
					outlineOpacity: this.config.strokeOpacity ?? 1,
				},
			});
		}

		public get options(): Configuration.DrawFilledShapeConfig {
			return this.config;
		}

		public get terraDrawModeName(): string {
			return Constants.ModeName.Rectangle;
		}
	}
}