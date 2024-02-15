/// <reference path="../../../../../OSFramework/Maps/Configuration/AbstractConfiguration.ts" />

// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace Provider.Maps.Google.Configuration.Marker {
	export class GoogleMarkerConfig
		extends OSFramework.Maps.Configuration.AbstractConfiguration
		implements OSFramework.Maps.Configuration.IConfigurationMarker
	{
		public allowDrag: boolean;
		public iconHeight: number;
		public iconUrl: string;
		public iconWidth: number;
		public label: string;
		public location: string;
		public title: string;

		// No need for constructor, as it is not doing anything. Left the constructor, to facilitade future usage.
		// constructor(config: unknown) {
		//     super(config);
		// }

		public getProviderConfig(): unknown {
			const provider = {
				draggable: this.allowDrag,
				icon: this.iconUrl,
				label: this.label,
				location: this.location,
				title: this.title,
			};

			//Deleting all the undefined properties
			Object.keys(provider).forEach((key) => {
				if (provider[key] === undefined) delete provider[key];
			});

			return provider;
		}
	}
}
