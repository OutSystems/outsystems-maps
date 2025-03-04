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

		constructor(config: unknown) {
			super(config);
			//making sure that the iconHeight and iconWidth are numbers
			this.iconHeight = Number(this.iconHeight);
			this.iconWidth = Number(this.iconWidth);
		}

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
