namespace Provider.Maps.Google.Helper {
	export class RouteRenderer implements OSFramework.Maps.Interface.IDisposable {
		private _isRouteRendered: boolean;
		private _map: OSMap.IMapGoogle;
		private _pathPolyline: google.maps.Polyline;
		private _routeMarkers: google.maps.marker.AdvancedMarkerElement[];

		constructor(map: OSMap.IMapGoogle) {
			this._map = map;
			this._isRouteRendered = false;
			this._routeMarkers = [];
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
			this._routeMarkers = [];
			this._pathPolyline = undefined;
			this._isRouteRendered = false;
		}

		public removeRoute(): void {
			if (this._pathPolyline) {
				this._pathPolyline.setMap(null);
				this._pathPolyline = undefined;
			}
			this._routeMarkers.forEach((marker) => {
				marker.map = undefined;
			});
			this._routeMarkers = [];
			this._isRouteRendered = false;
		}

		public renderRoute(encodedPolyline: string): OSFramework.Maps.OSStructures.ReturnMessage {
			this._isRouteRendered && this.removeRoute();

			if (encodedPolyline) {
				const bounds = new google.maps.LatLngBounds();
				const routePath = google.maps.geometry.encoding.decodePath(encodedPolyline);

				// Create the polyline for the route path.
				this._pathPolyline = new google.maps.Polyline({
					path: routePath,
					strokeColor: '#4285F470', // A solid red color
					strokeWeight: 6,
					map: this._map.provider,
				});


				// Set the map bounds to fit the route.
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
