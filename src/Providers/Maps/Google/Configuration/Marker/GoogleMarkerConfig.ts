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

		public getProviderConfig(): unknown {
			const provider = {
				draggable: this.allowDrag,
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
