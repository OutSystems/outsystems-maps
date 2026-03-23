/// <reference path="./DrawConfig.ts" />

// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace Provider.DrawingTools.TerraDraw.Configuration {
	export abstract class DrawBasicShapeConfig extends DrawConfig {
		/** Deserialized from OutSystems config. Not yet wired into TerraDraw SelectMode flags. */
		public allowEdit: boolean;
		public strokeColor: string;
		public strokeOpacity: number;
		public strokeWeight: number;
	}
}
