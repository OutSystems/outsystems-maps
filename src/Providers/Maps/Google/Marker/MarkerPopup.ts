/// <reference path="../../../../OSFramework/Maps/Marker/AbstractMarker.ts" />
/// <reference path="Marker.ts" />

// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace Provider.Maps.Google.Marker {
	export class MarkerPopup
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		extends Marker
		implements OSFramework.Maps.Marker.IMarkerPopup
	{
		private _contentString: string;

		protected _setMarkerEvents(): void {
			super._setMarkerEvents();

			// Open the popup when the user clicks on the Marker
			// To close the Marker click on it and then use the ESC or the "x" on the top right corner of the popup
			// Or use the API method - closePopup()
			this._provider.addListener('click', () => {
				this.refreshPopupContent();
				this.openPopup();
			});
		}

		public get hasPopup(): boolean {
			return true;
		}

		public get markerTag(): string {
			return OSFramework.Maps.Helper.Constants.markerPopupTag;
		}

		public closePopup(): void {
			this.map.features.infoWindow.closePopup();
		}

		public openPopup(): void {
			this.refreshPopupContent();
			this.map.features.infoWindow.openPopup(this);
		}

		public refreshPopupContent(): void {
			this._contentString = OSFramework.Maps.Helper.GetElementByUniqueId(this.uniqueId).querySelector(
				OSFramework.Maps.Helper.Constants.markerPopup
			).innerHTML;
			this.map.features.infoWindow.setPopupContent(this._contentString);
		}
	}
}
