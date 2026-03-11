/// <reference path="AbstractDrawPolyshape.ts" />

// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace Provider.DrawingTools.TerraDraw {
	export class DrawPolygon extends AbstractDrawPolyshape<Provider.Maps.Google.Configuration.DrawingTools.DrawFilledShapeConfig> {
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
				new Provider.Maps.Google.Configuration.DrawingTools.DrawFilledShapeConfig(configs)
			);
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
			return OSFramework.Maps.Helper.Constants.drawingPolygonCompleted;
		}

		protected createElement(
			uniqueId: string,
			feature: TerraDrawGeoJSONFeature,
			configs: Provider.Maps.Google.Configuration.DrawingTools.DrawFilledShapeConfig
		): OSFramework.Maps.Shape.IShape {
			const locations = this.extractLocations(feature);
			const finalConfigs = { ...configs, locations: JSON.stringify(locations) };
			return super.createShapeElement(uniqueId, OSFramework.Maps.Enum.ShapeType.Polygon, finalConfigs);
		}

		public createTerraDrawMode(): TerraDrawBaseDrawMode {
			return new globalThis.terraDraw.TerraDrawPolygonMode({
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
			return 'polygon';
		}
	}
}
