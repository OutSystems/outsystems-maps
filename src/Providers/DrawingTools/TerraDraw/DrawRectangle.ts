/// <reference path="../AbstractDrawShape.ts" />

// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace Provider.DrawingTools.TerraDraw {
	export class DrawRectangle extends AbstractDrawShape<Configuration.DrawFilledShapeConfig> {
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
				Constants.ModeName.Rectangle,
				new Configuration.DrawFilledShapeConfig(configs)
			);
		}

		/**
		 * Derives axis-aligned bounds from the rectangle polygon's corner vertices.
		 * TerraDraw stores rectangles as closed Polygons: 5 points (4 corners + closing duplicate).
		 * GeoJSON coordinates are [lng, lat], so index 0 is lng and index 1 is lat.
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

		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		protected applyStyleChange(propertyName: string, value: unknown): void {
			const draw = this.drawingTools.provider as TerraDrawInstance;
			draw.updateModeOptions(this.type, this.config.getProviderConfig());
		}

		protected get completedToolEventName(): string {
			return OSFramework.Maps.Helper.Constants.drawingRectangleCompleted;
		}

		protected createElement(
			uniqueId: string,
			feature: TerraDrawGeoJSONFeature,
			configs: OSFramework.Maps.Configuration.IConfigurationShape
		): OSFramework.Maps.Shape.IShape {
			const bounds = this._extractBounds(feature);
			const finalConfigs = {
				...configs,
				bounds: JSON.stringify(bounds),
			};
			return super.createShapeElement(uniqueId, OSFramework.Maps.Enum.ShapeType.Rectangle, finalConfigs);
		}

		protected getCoordinates(feature: TerraDrawGeoJSONFeature): string {
			return JSON.stringify(this._extractBounds(feature));
		}

		protected getLocation(feature: TerraDrawGeoJSONFeature): string {
			return JSON.stringify(this._extractBounds(feature));
		}

		public createTerraDrawMode(): TerraDrawBaseDrawMode {
			return new globalThis.terraDraw.TerraDrawRectangleMode(this.config.getProviderConfig());
		}

		public get options(): Configuration.DrawRectangleConfig {
			return this.config;
		}
	}
}
