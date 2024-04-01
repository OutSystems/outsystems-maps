/// <reference path="../../../../../OSFramework/Maps/Configuration/AbstractConfiguration.ts" />

// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace Provider.Maps.Google.Configuration.DrawingTools {
	export class DrawingToolsConfig
		extends OSFramework.Maps.Configuration.AbstractConfiguration
		implements OSFramework.Maps.Configuration.IConfigurationDrawingTools
	{
		public position: string;
		public uniqueId: string;

		public getProviderConfig(): unknown {
			return {
				position: this.position,
			};
		}
	}
}
