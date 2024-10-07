/// <reference path="../../../../OSFramework/Maps/Marker/AbstractMarker.ts" />

// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace Provider.Maps.Google.Marker {
	export class Marker
		extends OSFramework.Maps.Marker.AbstractMarker<
			google.maps.marker.AdvancedMarkerElement,
			Configuration.Marker.GoogleMarkerConfig
		>
		implements IMarkerGoogle
	{
		private readonly _addedEvents: Array<string>;

		constructor(
			map: OSFramework.Maps.OSMap.IMap,
			markerId: string,
			type: OSFramework.Maps.Enum.MarkerType,
			configs: unknown
		) {
			super(map, markerId, type, new Configuration.Marker.GoogleMarkerConfig(configs));
			this._addedEvents = [];
		}

		private _setIcon(): void {
			if (this.config.label !== '' || this.config.iconUrl !== '') {
				try {
					const height = this.config.iconHeight;
					const width = this.config.iconWidth;

					const markerIconWrapper = document.createElement('div');
					markerIconWrapper.className = 'os-marker-icon';

					if (this.config.iconUrl !== '') {
						const markerIconImage = document.createElement('img');
						markerIconImage.src = this.config.iconUrl;
						if (height > 0 && width > 0) {
							markerIconImage.height = height;
							markerIconImage.width = width;
						}
						markerIconWrapper.append(markerIconImage);

						if (this.config.label !== '') {
							const labelWrapper = document.createElement('div');
							labelWrapper.className = 'os-marker-icon-label';
							labelWrapper.textContent = this.config.label;
							markerIconWrapper.appendChild(labelWrapper);
						}
						this._provider.content = markerIconWrapper;
					} else {
						markerIconWrapper.textContent = this.config.label;

						const markerIcon = new google.maps.marker.PinElement({ glyph: markerIconWrapper });
						this._provider.content = markerIcon.element;
					}
				} catch (e) {
					console.error(e);
				}
			} else {
				this._provider.content = undefined;
			}
		}

		/**
		 * Method that will trigger the event of the Marker. This method helps obtaining the
		 * coordinates in the correct way and then trigger the event.
		 *
		 * @private
		 * @param {OSFramework.Maps.Event.Marker.MarkerEventType} eventType
		 * @param {string} eventName
		 * @param {(number | (() => number))} lat
		 * @param {(number | (() => number))} lng
		 * @memberof Marker
		 */
		private _triggerEvent(
			eventType: OSFramework.Maps.Event.Marker.MarkerEventType,
			eventName: string,
			lat: number | (() => number),
			lng: number | (() => number)
		): void {
			const coordinates = new OSFramework.Maps.OSStructures.OSMap.OSCoordinates(
				Helper.Conversions.GetCoordinateValue(lat),
				Helper.Conversions.GetCoordinateValue(lng)
			);

			this.markerEvents.trigger(
				// EventType
				eventType,
				// EventName
				eventName,
				// Coords
				JSON.stringify(coordinates)
			);
		}

		protected _buildMarkerPosition(): Promise<google.maps.marker.AdvancedMarkerElementOptions> {
			const markerOptions: google.maps.marker.AdvancedMarkerElementOptions = {};
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
					this._triggerEvent(
						OSFramework.Maps.Event.Marker.MarkerEventType.OnClick,
						OSFramework.Maps.Event.Marker.MarkerEventType.OnClick,
						e.latLng.lat,
						e.latLng.lng
					);
				});
			}

			// Other Provider Events (OS Marker Event Block)
			// Any events that got added to the markerEvents via the API Subscribe method will have to be taken care here
			// If the Event type of each handler is MarkerProviderEvent, we want to make sure to add that event to the listeners of the google marker provider (e.g. click, dblclick, contextmenu, etc)
			this.markerEvents.handlers.forEach((handler: OSFramework.Maps.Event.IEvent<string>, eventName) => {
				if (handler instanceof OSFramework.Maps.Event.Marker.MarkerProviderEvent) {
					const ProviderEventName = Constants.Marker.ProviderEventNames[eventName];

					if (ProviderEventName !== undefined) {
						this._addedEvents.push(eventName);
						this._provider.addListener(
							// Name of the event (e.g. click, dblclick, contextmenu, etc)
							ProviderEventName,
							// Callback CAN have an attribute (e) which is of the type MapMouseEvent
							// Trigger the event by specifying the ProviderEvent MarkerType and the coords (lat, lng) if the callback has the attribute MapMouseEvent
							(e: google.maps.MapMouseEvent) => {
								this._triggerEvent(
									OSFramework.Maps.Event.Marker.MarkerEventType.ProviderEvent,
									eventName,
									e.latLng.lat,
									e.latLng.lng
								);
							}
						);
					} else {
						const HtmlEventName = Constants.Marker.ProviderEventNamesHtml[eventName];

						if (HtmlEventName !== undefined) {
							this._addedEvents.push(eventName);
							this._provider.element.addEventListener(
								// Name of the event (e.g. click, dblclick, contextmenu, etc)
								HtmlEventName,
								// Callback CAN have an attribute (e) which is of the type MapMouseEvent
								// Trigger the event by specifying the ProviderEvent MarkerType and the coords (lat, lng) if the callback has the attribute MapMouseEvent
								() => {
									this._triggerEvent(
										OSFramework.Maps.Event.Marker.MarkerEventType.ProviderEvent,
										eventName,
										this._provider.position.lat,
										this.provider.position.lng
									);
								}
							);
						} else {
							console.error(`Event ${eventName} is not a valid event for the Marker.`);
						}
					}
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

						this._provider = new google.maps.marker.AdvancedMarkerElement({
							...(this.getProviderConfig() as unknown[]),
							position: markerOptions.position,
							map: this.map.provider,
						});

						// Call this method to set marker icon
						this._setIcon();

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
								this._provider.position = {
									lat: response.lat as number,
									lng: response.lng as number,
								};
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
						this._provider.gmpDraggable = propertyValue as boolean;
						break;
					case OSFramework.Maps.Enum.OS_Config_Marker.iconHeight:
					case OSFramework.Maps.Enum.OS_Config_Marker.iconWidth:
					case OSFramework.Maps.Enum.OS_Config_Marker.iconUrl:
					case OSFramework.Maps.Enum.OS_Config_Marker.label:
						this._setIcon();
						break;
					case OSFramework.Maps.Enum.OS_Config_Marker.title:
						this._provider.title = propertyValue as string;
						break;
				}
			}
		}

		public dispose(): void {
			if (this.isReady) {
				this._provider.map = undefined;
			}
			this._provider = undefined;
			super.dispose();
		}

		public refreshProviderEvents(): void {
			if (this.isReady) this._setMarkerEvents();
		}

		public validateProviderEvent(eventName: string): boolean {
			return (
				Constants.Marker.ProviderEventNames[eventName] !== undefined ||
				Constants.Marker.ProviderEventNamesHtml[eventName] !== undefined
			);
		}
	}
}
