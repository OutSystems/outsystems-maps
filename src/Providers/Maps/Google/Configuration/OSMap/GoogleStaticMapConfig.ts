// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace Provider.Maps.Google.Configuration.OSMap {
	export class GoogleStaticMapConfig
		extends OSFramework.Maps.Configuration.AbstractConfiguration
		implements OSFramework.Maps.Configuration.IConfigurationMap
	{
		public apiKey: string;
		public center: string | OSFramework.Maps.OSStructures.OSMap.Coordinates;
		public height: string;
		public type: OSFramework.Maps.Enum.OSMap.Type;
		public uniqueId: string;
		public zoom: OSFramework.Maps.Enum.OSMap.Zoom;

		public getProviderConfig(): unknown {
			const provider = {
				center: this.center,
				zoom: this.zoom,
				mapTypeId: this.type,
			};

			//Cleanning undefined properties
			Object.keys(provider).forEach((key) => {
				if (provider[key] === undefined) {
					delete provider[key];
				}
			});

			return provider;
		}
	}
}
