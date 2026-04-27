/// <reference path="./AbstractDrawPolyshape.ts" />
// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace Provider.DrawingTools.TerraDraw.Tools {
	export class DrawPolyline extends AbstractDrawPolyshape<Configuration.DrawPolylineConfig> {
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
				Constants.ModeName.LineString,
				new Configuration.DrawPolylineConfig(configs)
			);
		}

		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		protected applyStyleChange(propertyName: string, value: unknown): void {
			const draw = this.drawingTools.provider as TerraDrawInstance;
			draw.updateModeOptions(this.type, this.config.getProviderConfig());
		}

		protected get completedToolEventName(): string {
			return OSFramework.Maps.Helper.Constants.drawingPolylineCompleted;
		}

		protected createElement(
			uniqueId: string,
			feature: TerraDrawGeoJSONFeature,
			configs: OSFramework.Maps.Configuration.IConfigurationShape
		): OSFramework.Maps.Shape.IShape {
			const locations = this.extractLocations(feature);
			const finalConfigs = {
				...configs,
				locations: JSON.stringify(locations),
			};
			return super.createShapeElement(uniqueId, OSFramework.Maps.Enum.ShapeType.Polyline, finalConfigs);
		}

		public createTerraDrawMode(): TerraDrawBaseDrawMode {
			return new window.terraDraw.TerraDrawLineStringMode(
				this.config.getProviderConfig() as ConstructorParameters<typeof window.terraDraw.TerraDrawLineStringMode>[0]
			);
		}
	}
}
