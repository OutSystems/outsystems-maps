namespace Provider.Maps.Google.Helper {
	export class RouteRenderer implements OSFramework.Maps.Interface.IDisposable {
		private _endMarker: google.maps.marker.AdvancedMarkerElement;
		private _isRouteRendered: boolean;
		private _map: OSMap.IMapGoogle;
		private _pathPolyline: google.maps.Polyline;
		private _startMarker: google.maps.marker.AdvancedMarkerElement;

		constructor(map: OSMap.IMapGoogle) {
			this._map = map;
			this._isRouteRendered = false;
		}

		private _buildMarker(position: google.maps.LatLng, label: string): google.maps.marker.AdvancedMarkerElement {
			// The pin element is the colored teardrop shape.
			const pin = new google.maps.marker.PinElement({
				background: '#EA4335', // Red background
				borderColor: '#D6352D', // Dark red border
				glyphColor: '#FFFFFF', // White letter
				scale: 1,
			});

			// Create the advanced marker.
			const marker = new google.maps.marker.AdvancedMarkerElement({
				position: {
					lat: Helper.Conversions.GetCoordinateValue(position.lat()),
					lng: Helper.Conversions.GetCoordinateValue(position.lng()),
				},
				map: this._map.provider,
				content: pin.element,
			});

			pin.glyph = label;

			return marker;
		}

		public dispose(): void {
			this.removeRoute();
			this._map = undefined;
			this._startMarker = undefined;
			this._endMarker = undefined;
			this._pathPolyline = undefined;
			this._isRouteRendered = false;
		}

		public removeRoute(): void {
			if (this._pathPolyline) {
				this._pathPolyline.setMap(null);
				this._pathPolyline = undefined;
			}
			if (this._startMarker) {
				this._startMarker.map = undefined;
				this._startMarker = undefined;
			}
			if (this._endMarker) {
				this._endMarker.map = null;
				this._endMarker = undefined;
			}
			this._isRouteRendered = false;
		}

		public renderRoute(encodedPolyline: string): OSFramework.Maps.OSStructures.ReturnMessage {
			this._isRouteRendered && this.removeRoute();

			if (encodedPolyline) {
				const bounds = new google.maps.LatLngBounds();
				const routePath = google.maps.geometry.encoding.decodePath(encodedPolyline);

				this._startMarker = this._buildMarker(routePath[0], 'A');
				bounds.extend(routePath[0]);

				this._pathPolyline = new google.maps.Polyline({
					path: routePath,
					strokeColor: '#4285F470', // A solid red color
					strokeWeight: 6,
					map: this._map.provider,
				});
				this._endMarker = this._buildMarker(routePath[routePath.length - 1], 'B');
				bounds.extend(routePath[routePath.length - 1]);

				this._map.provider.fitBounds(bounds);

				this._isRouteRendered = true;

				return {
					isSuccess: true,
				};
			} else {
				return {
					code: OSFramework.Maps.Enum.ErrorCodes.LIB_FailedSetDirections,
					message: 'Encoded polyline is empty or undefined.',
				};
			}
		}
	}
}
