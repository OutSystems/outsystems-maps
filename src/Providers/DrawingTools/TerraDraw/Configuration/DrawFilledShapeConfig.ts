/// <reference path="./DrawBasicShapeConfig.ts" />

// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace Provider.DrawingTools.TerraDraw.Configuration {
	export abstract class DrawFilledShapeConfig extends DrawBasicShapeConfig {
		public fillColor: string;
		public fillOpacity: number;
	}
}
