// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace Provider.DrawingTools.TerraDraw.Tools {
	export class DrawPolygon extends AbstractDrawPolyshape<Configuration.DrawFilledShapeConfig> {
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
				Constants.ModeName.Polygon,
				new Configuration.DrawFilledShapeConfig(configs)
			);
		}

		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		protected applyStyleChange(propertyName: string, value: unknown): void {
			const draw = this.drawingTools.provider as TerraDrawInstance;
			draw.updateModeOptions(this.type, this.config.getProviderConfig());
		}

		protected get completedToolEventName(): string {
			return OSFramework.Maps.Helper.Constants.drawingPolygonCompleted;
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
			return super.createShapeElement(uniqueId, OSFramework.Maps.Enum.ShapeType.Polygon, finalConfigs);
		}

		public createTerraDrawMode(): TerraDrawBaseDrawMode {
			return new globalThis.terraDraw.TerraDrawPolygonMode(this.config.getProviderConfig());
		}
	}
}
