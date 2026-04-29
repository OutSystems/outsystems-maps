// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace Provider.DrawingTools.TerraDraw.Configuration {
	export class DrawingToolsConfig
		extends OSFramework.Maps.Configuration.AbstractConfiguration
		implements OSFramework.Maps.Configuration.IConfigurationDrawingTools
	{
		public position: string;
		public providerType: OSFramework.Maps.Enum.ProviderType;
		public uniqueId: string;

		constructor(configs: unknown) {
			super(configs);
			this.providerType ??= OSFramework.Maps.Enum.ProviderType.Google;
		}

		public getProviderConfig(): unknown {
			return {
				position: this.position,
			};
		}
	}
}
