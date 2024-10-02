/// <reference path="AbstractProviderTool.ts" />

// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace Provider.Maps.Google.DrawingTools {
	export class DrawMarker extends AbstractProviderTool<Configuration.DrawingTools.DrawMarkerConfig> {
		private _latLng = {
			lat: undefined,
			lng: undefined,
		};
		constructor(
			map: OSFramework.Maps.OSMap.IMap,
			drawingTools: OSFramework.Maps.DrawingTools.IDrawingTools,
			drawingToolsId: string,
			type: string,
			configs: unknown
		) {
			super(map, drawingTools, drawingToolsId, type, new Configuration.DrawingTools.DrawMarkerConfig(configs));
		}

		private _setOnChangeEvent(_marker: OSFramework.Maps.Marker.IMarker): void {
			_marker.markerEvents.addHandler(
				// changing the marker location is only available via the drag-and-drop, so the solution passes by adding the dragend event listener as the marker's OnChanged event
				'dragend' as OSFramework.Maps.Event.Marker.MarkerEventType,
				// Trigger the onDrawingChangeEvent with the extra information (marker uniqueId and flag indicating that the element is not new)
				() => {
					const _latitude = Helper.Conversions.GetCoordinateValue(_marker.getPosition().lat);
					const _longitude = Helper.Conversions.GetCoordinateValue(_marker.getPosition().lng);

					this.triggerOnDrawingChangeEvent(
						_marker.uniqueId,
						false,
						JSON.stringify({
							Lat: _latitude,
							Lng: _longitude,
						}),
						`${_latitude}, ${_longitude}`
					);
				}
			);
		}

		/** Get the constant for the event markercomplete */
		protected get completedToolEventName(): string {
			return OSFramework.Maps.Helper.Constants.drawingMarkerCompleted;
		}

		public get options(): GoogleMapsMarkerOptions {
			return this.drawingTools.provider.get('markerOptions');
		}

		protected set options(options: GoogleMapsMarkerOptions) {
			const allOptions = { ...this.options, ...options };
			this.drawingTools.provider.setOptions({
				markerOptions: allOptions,
			});
		}

		protected createElement(
			uniqueId: string,
			marker: GoogleMapsMarker,
			configs: unknown[]
		): OSFramework.Maps.Marker.IMarker {
			let position = undefined;

			if (Helper.TypeChecker.IsAdvancedMarker(marker)) {
				position = (marker as google.maps.marker.AdvancedMarkerElement).position;
			} else {
				position = (marker as google.maps.Marker).getPosition();
			}

			const _latitude = Helper.Conversions.GetCoordinateValue(position.lat);
			const _longitude = Helper.Conversions.GetCoordinateValue(position.lng);

			const location = `${_latitude},${_longitude}`;

			this._latLng.lat = _latitude;
			this._latLng.lng = _longitude;

			// Join both the configs that were provided for the new marker element and the location that was provided by the DrawingTools markercomplete event
			const finalConfigs = { ...configs, location };

			const _marker = Marker.MarkerFactory.MakeMarker(
				this.map,
				uniqueId,
				OSFramework.Maps.Enum.MarkerType.Marker,
				finalConfigs
			);

			// Add the onChange event to the new element
			this._setOnChangeEvent(_marker);
			// Add the new element to the map
			this.map.addMarker(_marker);
			return _marker;
		}

		/** Gets the coordinates of the new marker, with the expected lat/lng structure */
		protected getCoordinates(): string {
			const locations = this.newElm.config.location;
			let coordinatesArray = [];

			coordinatesArray = locations.split(',');

			const coordinates = {
				Lat: coordinatesArray[0],
				Lng: coordinatesArray[1],
			};

			return JSON.stringify(coordinates);
		}

		/** Gets the location of the new shape (marker), as a string */
		protected getLocation(): string {
			return this.newElm.config.location;
		}

		public build(): void {
			super.build();
		}

		public changeProperty(propertyName: string, value: unknown): void {
			const propValue = OSFramework.Maps.Enum.OS_Config_Marker[propertyName];
			super.changeProperty(propertyName, value);
			if (this.drawingTools.isReady) {
				if (propValue === OSFramework.Maps.Enum.OS_Config_Marker.iconUrl) {
					this.options = { icon: value as string };
				}
			}
		}
	}
}
