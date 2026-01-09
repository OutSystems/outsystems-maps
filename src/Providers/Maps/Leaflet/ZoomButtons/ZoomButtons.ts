namespace Provider.Maps.Leaflet.ZoomButtons {
	// This class allow to restablish the Zoom buttons but redefining the logic to avoid
	// Leaflet to scroll the page
	export class ZoomButtons extends L.Control.Zoom {
		private _map: L.Map;

		// Follows the internal logic in Leaflet but preventing scroll over the page
		protected _refocusOnMap(e: PointerEvent) {
			if (this._map && e && e.screenX > 0 && e.screenY > 0) {
				this._map.getContainer().focus({ preventScroll: true });
			}
		}
	}
}
