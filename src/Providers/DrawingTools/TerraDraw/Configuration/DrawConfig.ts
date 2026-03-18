// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace Provider.DrawingTools.TerraDraw.Configuration {
	export abstract class DrawConfig
		extends OSFramework.Maps.Configuration.AbstractConfiguration
		implements OSFramework.Maps.Configuration.IConfigurationTool
	{
		public allowDrag: boolean;
		public uniqueId: string;

		public abstract getProviderConfig(): unknown[];
	}
}
