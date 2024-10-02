// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace Provider.Maps.Google.Configuration.OSMap {
	export class GoogleMapConfig
		extends OSFramework.Maps.Configuration.AbstractConfiguration
		implements OSFramework.Maps.Configuration.IConfigurationMap
	{
		public advancedFormat: string;
		public apiKey: string;
		public autoZoomOnShapes: boolean;
		public center: string | OSFramework.Maps.OSStructures.OSMap.Coordinates;
		public height: string;
		public localization: OSFramework.Maps.OSStructures.OSMap.Localization;
		public mapStyleId: string;
		public markerClusterer: OSFramework.Maps.Configuration.IConfigurationMarkerClusterer;
		public offset: OSFramework.Maps.OSStructures.OSMap.Offset;
		public respectUserZoom: boolean;
		public showTraffic: boolean;
		public style: OSFramework.Maps.Enum.OSMap.Style;
		public type: OSFramework.Maps.Enum.OSMap.Type;
		public uniqueId: string;
		public useAdvancedMarkers: boolean;
		public zoom: OSFramework.Maps.Enum.OSMap.Zoom;

		public getProviderConfig(): unknown {
			let mapStyleId = this.mapStyleId;
			let style = this.style;

			//Safe guard to assure that the mapId is not set when advancedMarkers is false
			if (this.useAdvancedMarkers === false) {
				mapStyleId = undefined;
			} else {
				// In Low-Code the style is 1-based, so we need to subtract 1 to match the enum
				// which is 0-based.
				const styleId = this.style - 1;
				if (styleId === OSFramework.Maps.Enum.OSMap.Style.Standard) {
					// If the developer is using the advanced markers and the style is standard, the style will be set
					// to undefined (and subsequently removed) to avoid conflicts with the mapId.
					style = undefined;
				}
			}

			const provider = {
				center: this.center,
				mapId: mapStyleId,
				mapTypeId: this.type,
				styles: style,
				zoom: this.zoom,
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
