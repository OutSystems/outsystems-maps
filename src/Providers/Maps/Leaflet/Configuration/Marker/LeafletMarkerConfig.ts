/// <reference path="../../../../../OSFramework/Maps/Configuration/AbstractConfiguration.ts" />

// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace Provider.Maps.Leaflet.Configuration.Marker {
	export class LeafletMarkerConfig
		extends OSFramework.Maps.Configuration.AbstractConfiguration
		implements OSFramework.Maps.Configuration.IConfigurationMarker
	{
		public allowDrag?: boolean;
		public iconHeight?: number;
		public iconUrl?: string;
		public iconWidth?: number;
		public label?: string;
		public location: string;
		public title?: string;

		// No need for constructor, as it is not doing anything. Left the constructor, to facilitade future usage.
		// constructor(
		//     config: JSON | OSFramework.Maps.Configuration.IConfigurationMarker
		// ) {
		//     super(config);
		// }

		public getProviderConfig(): L.MarkerOptions {
			const provider: L.MarkerOptions = {
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
