/// <reference path="AbstractDrawPolyshape.ts" />

// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace Provider.DrawingTools.TerraDraw {
	export class DrawPolyline extends AbstractDrawPolyshape<Provider.Maps.Google.Configuration.DrawingTools.DrawBasicShapeConfig> {
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
				new Provider.Maps.Google.Configuration.DrawingTools.DrawBasicShapeConfig(configs)
			);
		}

		protected applyStyleChange(propertyName: string, value: unknown): void {
			const draw = this.drawingTools.provider as TerraDrawInstance;
			const propValue = OSFramework.Maps.Enum.OS_Config_Shape[propertyName];
			const styleMap: Record<number, Record<string, unknown>> = {
				[OSFramework.Maps.Enum.OS_Config_Shape.strokeColor]: { lineStringColor: value },
				[OSFramework.Maps.Enum.OS_Config_Shape.strokeWeight]: { lineStringWidth: value },
				[OSFramework.Maps.Enum.OS_Config_Shape.strokeOpacity]: { lineStringOpacity: value },
			};
			if (styleMap[propValue]) {
				draw.updateModeOptions(this.terraDrawModeName, { styles: styleMap[propValue] });
			}
		}

		protected get completedToolEventName(): string {
			return OSFramework.Maps.Helper.Constants.drawingPolylineCompleted;
		}

		protected createElement(
			uniqueId: string,
			feature: TerraDrawGeoJSONFeature,
			configs: Provider.Maps.Google.Configuration.DrawingTools.DrawBasicShapeConfig
		): OSFramework.Maps.Shape.IShape {
			const locations = this.extractLocations(feature);
			const finalConfigs = { ...configs, locations: JSON.stringify(locations) };
			return super.createShapeElement(uniqueId, OSFramework.Maps.Enum.ShapeType.Polyline, finalConfigs);
		}

		public createTerraDrawMode(): TerraDrawBaseDrawMode {
			return new globalThis.terraDraw.TerraDrawLineStringMode({
				styles: {
					lineStringColor: (this.config.strokeColor ?? '#555555') as TerraDrawHexColor,
					lineStringWidth: this.config.strokeWeight ?? 2,
					lineStringOpacity: this.config.strokeOpacity ?? 1,
				},
			});
		}

		public get options(): Provider.Maps.Google.Configuration.DrawingTools.DrawBasicShapeConfig {
			return this.config;
		}

		public get terraDrawModeName(): string {
			return 'linestring';
		}
	}
}
