/// <reference path="../../../../OSFramework/Maps/Marker/AbstractMarker.ts" />

// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace Provider.Maps.Google.Marker {
	export class DeprecatedMarker
		extends OSFramework.Maps.Marker.AbstractMarker<google.maps.Marker, Configuration.Marker.GoogleMarkerConfig>
		implements IMarkerGoogle
	{
		private _addedEvents: Array<string>;

		constructor(
			map: OSFramework.Maps.OSMap.IMap,
			markerId: string,
			type: OSFramework.Maps.Enum.MarkerType,
			configs: unknown
		) {
			super(map, markerId, type, new Configuration.Marker.GoogleMarkerConfig(configs));
			this._addedEvents = [];
		}

		private _setIcon(url: string): void {
			// If the iconUrl is not set or is empty, we should use the defaultIcon
			if (url === '') {
				// Set the icon to the default Marker provider
				this.provider.setIcon(null);
			} else {
				try {
					let anchorCalc: google.maps.Point;
					let scaledSize: google.maps.Size;
					//Explicit conversion to number - related with ROU-4592 - as Google will behave differently depending on the type
					//of the input. Before, in runtime, the input was of type string.
					const height = Number(this.config.iconHeight);
					const width = Number(this.config.iconWidth);
					// If the size of the icon is defined by a valid width and height, use those values
					// Else If nothing is passed or the icon size has the width or the height equal to 0, use the full image size
					if (
						OSFramework.Maps.Helper.IsValidNumber(height) &&
						OSFramework.Maps.Helper.IsValidNumber(width) &&
						height > 0 &&
						width > 0
					) {
						// Anchor at bottom center (half width, full height)
						anchorCalc = new google.maps.Point(width / 2, height);
						scaledSize = new google.maps.Size(width, height);
					}
					// Update the icon using the previous configurations
					const icon = {
						url: url,
						scaledSize: scaledSize,
						anchor: anchorCalc,
						origin: new google.maps.Point(0, 0),
					};
					// Set the icon to the Marker provider
					this.provider.setIcon(icon);
				} catch (e) {
					// Could not load image from specified URL
					console.error(e);
				}
			}
		}

		/**
		 * This method is usefull to be used by the changeProperty method only
		 * As it requires a config update before being able to use it
		 */
		private _setIconSize(): void {
			// The width and the height of the icon will be acquired using the config.iconWidth and config.iconHeight
			// Therefore, just by calling the _setIcon private method we are going to set the same iconUrl that is already being used
			// But the icon will be updated and will be using the new size
			this._setIcon(this.config.iconUrl);
		}

		protected _buildMarkerPosition(): Promise<google.maps.MarkerOptions> {
			const markerOptions: google.maps.MarkerOptions = {};
			// If the marker has no location at the moment of its provider creation, then throw an error
			// If the marker has its location = "" at the moment of its provider creation, then the location value will be the default -> OutSystems, Boston US
			if (typeof this.config.location === 'undefined') {
				this.map.mapEvents.trigger(
					OSFramework.Maps.Event.OSMap.MapEventType.OnError,
					this.map,
					OSFramework.Maps.Enum.ErrorCodes.LIB_FailedGeocodingMarker,
					`Location of the Marker can't be empty.`
				);
			} else {
				// Let's return a promise that will be resolved or rejected according to the result
				return new Promise((resolve, reject) => {
					Helper.Conversions.ConvertToCoordinates(this.config.location)
						.then((response) => {
							markerOptions.position = {
								lat: response.lat as number,
								lng: response.lng as number,
							};
							resolve(markerOptions);
						})
						.catch((e) => reject(e));
				});
			}
		}

		protected _setMarkerEvents(): void {
			// Make sure the listeners get removed before adding the new ones
			this._addedEvents.forEach((eventListener, index) => {
				google.maps.event.clearListeners(this.provider, eventListener);
				this._addedEvents.splice(index, 1);
			});

			// OnClick Event (OS accelerator)
			if (this.markerEvents.hasHandlers(OSFramework.Maps.Event.Marker.MarkerEventType.OnClick)) {
				this._addedEvents.push('click');
				this._provider.addListener('click', (e: google.maps.MapMouseEvent) => {
					const coordinates = new OSFramework.Maps.OSStructures.OSMap.OSCoordinates(
						e.latLng.lat(),
						e.latLng.lng()
					);
					this.markerEvents.trigger(
						// EventType
						OSFramework.Maps.Event.Marker.MarkerEventType.OnClick,
						// EventName
						OSFramework.Maps.Event.Marker.MarkerEventType.OnClick,
						// Coords
						JSON.stringify(coordinates)
					);
				});
			}

			// Other Provider Events (OS Marker Event Block)
			// Any events that got added to the markerEvents via the API Subscribe method will have to be taken care here
			// If the Event type of each handler is MarkerProviderEvent, we want to make sure to add that event to the listeners of the google marker provider (e.g. click, dblclick, contextmenu, etc)
			this.markerEvents.handlers.forEach((handler: OSFramework.Maps.Event.IEvent<string>, eventName) => {
				if (handler instanceof OSFramework.Maps.Event.Marker.MarkerProviderEvent) {
					this._addedEvents.push(eventName);
					this._provider.addListener(
						// Name of the event (e.g. click, dblclick, contextmenu, etc)
						Constants.Marker.ProviderEventNames[eventName],
						// Callback CAN have an attribute (e) which is of the type MapMouseEvent
						// Trigger the event by specifying the ProviderEvent MarkerType and the coords (lat, lng) if the callback has the attribute MapMouseEvent
						(e?: google.maps.MapMouseEvent) => {
							this.markerEvents.trigger(
								// EventType
								OSFramework.Maps.Event.Marker.MarkerEventType.ProviderEvent,
								// EventName
								eventName,
								// Coords
								e !== undefined
									? JSON.stringify({
											Lat: e.latLng.lat(),
											Lng: e.latLng.lng(),
										})
									: undefined
							);
						}
					);
				}
			});
		}

		/** Checks if the Marker has associated events */
		public get hasEvents(): boolean {
			return this.markerEvents !== undefined;
		}

		public get markerTag(): string {
			return OSFramework.Maps.Helper.Constants.markerTag;
		}

		public build(): void {
			super.build();

			// First build the Marker Position
			// Then, create the provider (Google maps Marker)
			// Then, set Marker events
			// Finally, refresh the Map
			const markerPosition = this._buildMarkerPosition();
			// If markerPosition is undefined (should be a promise) -> don't create the marker
			if (markerPosition !== undefined) {
				this.map.cancelScheduledResfresh();
				markerPosition
					.then((markerOptions) => {
						//The marker was destroyed while waiting for the promise.
						if (this._destroyed) return;

						this._provider = new google.maps.Marker({
							...(this.getProviderConfig() as unknown[]),
							...markerOptions,
							map: this.map.provider,
						});

						// Call this method so icon respects the sizes that are on config
						this._setIconSize();

						// We can only set the events on the provider after its creation
						this._setMarkerEvents();

						// Finish build of Marker
						this.finishBuild();

						// Trigger the new center location after creating the marker
						this.map.scheduleRefresh();
					})
					.catch((error) => {
						this.map.mapEvents.trigger(
							OSFramework.Maps.Event.OSMap.MapEventType.OnError,
							this.map,
							OSFramework.Maps.Enum.ErrorCodes.LIB_FailedGeocodingMarker,
							`${error}`
						);
					});
			}
		}

		public changeProperty(propertyName: string, propertyValue: unknown): void {
			const propValue = OSFramework.Maps.Enum.OS_Config_Marker[propertyName];
			super.changeProperty(propertyName, propertyValue);
			if (this.isReady) {
				switch (propValue) {
					case OSFramework.Maps.Enum.OS_Config_Marker.location:
						Helper.Conversions.ConvertToCoordinates(propertyValue as string)
							.then((response) => {
								this._provider.setPosition({
									lat: response.lat as number,
									lng: response.lng as number,
								});
								this.map.refresh();
							})
							.catch((error) => {
								this.map.mapEvents.trigger(
									OSFramework.Maps.Event.OSMap.MapEventType.OnError,
									this.map,
									OSFramework.Maps.Enum.ErrorCodes.LIB_FailedGeocodingMarker,
									`${error}`
								);
							});
						return;
					case OSFramework.Maps.Enum.OS_Config_Marker.allowDrag:
						return this._provider.setDraggable(propertyValue as boolean);
					case OSFramework.Maps.Enum.OS_Config_Marker.iconHeight:
					case OSFramework.Maps.Enum.OS_Config_Marker.iconWidth:
						this._setIconSize();
						return;
					case OSFramework.Maps.Enum.OS_Config_Marker.iconUrl:
						this._setIcon(propertyValue as string);
						return;
					case OSFramework.Maps.Enum.OS_Config_Marker.label:
						return this._provider.setLabel(propertyValue as string);
					case OSFramework.Maps.Enum.OS_Config_Marker.title:
						return this._provider.setTitle(propertyValue as string);
				}
			}
		}

		public dispose(): void {
			if (this.isReady) {
				this._provider.setMap(null);
			}
			this._provider = undefined;
			super.dispose();
		}

		public refreshProviderEvents(): void {
			if (this.isReady) this._setMarkerEvents();
		}

		public validateProviderEvent(eventName: string): boolean {
			return Constants.Marker.ProviderEventNames[eventName] !== undefined;
		}
	}
}
