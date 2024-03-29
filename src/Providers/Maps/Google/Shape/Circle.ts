/// <reference path="AbstractProviderShape.ts" />

// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace Provider.Maps.Google.Shape {
	export class Circle
		extends AbstractProviderShape<Configuration.Shape.CircleShapeConfig, google.maps.Circle>
		implements OSFramework.Maps.Shape.IShapeCircle
	{
		constructor(
			map: OSFramework.Maps.OSMap.IMap,
			shapeId: string,
			type: OSFramework.Maps.Enum.ShapeType,
			configs: unknown
		) {
			super(map, shapeId, type, new Configuration.Shape.CircleShapeConfig(configs));
		}

		private _buildCenter(location: string): Promise<OSFramework.Maps.OSStructures.OSMap.Coordinates> {
			// If the Shape doesn't have the minimum valid address/coordinates, then throw an error
			if (OSFramework.Maps.Helper.IsEmptyString(location)) {
				OSFramework.Maps.Helper.ThrowError(this.map, this.invalidShapeLocationErrorCode);
				return;
			}

			return new Promise((resolve, reject) => {
				Helper.Conversions.ConvertToCoordinates(location)
					.then((response) => {
						const coordinates = {
							lat: response.lat,
							lng: response.lng,
						};
						resolve(coordinates);
					})
					.catch((e) => reject(e));
			});
		}

		private _changeCenter(location: string): void {
			const shapeCenter = this._buildCenter(location);
			// If path is undefined (should be a promise) -> don't create the shape
			if (shapeCenter !== undefined) {
				shapeCenter
					.then((center) => {
						this.provider.setCenter(center as google.maps.LatLng);
					})
					.catch((error) => {
						OSFramework.Maps.Helper.ThrowError(
							this.map,
							OSFramework.Maps.Enum.ErrorCodes.LIB_FailedGeocodingShapeLocations,
							error
						);
					});
			}
		}

		protected _createProvider(center: OSFramework.Maps.OSStructures.OSMap.Coordinates): google.maps.Circle {
			return new google.maps.Circle({
				map: this.map.provider,
				center: center as google.maps.LatLngAltitudeLiteral,
				...(this.getProviderConfig() as Configuration.Shape.IShapeProviderConfig),
			});
		}

		protected get invalidShapeLocationErrorCode(): OSFramework.Maps.Enum.ErrorCodes {
			return OSFramework.Maps.Enum.ErrorCodes.CFG_InvalidCircleShapeCenter;
		}

		protected getShapeCoordinates(): OSFramework.Maps.OSStructures.OSMap.CircleCoordinates {
			return {
				coordinates: {
					Lat: this.providerCenter.lat as number,
					Lng: this.providerCenter.lng as number,
				},
				location: {
					location: `${this.providerCenter.lat.toString()},${this.providerCenter.lng.toString()}`,
					radius: this.providerRadius,
				},
			};
		}

		public get providerBounds(): google.maps.LatLngBounds {
			return this.provider.getBounds();
		}

		public get providerCenter(): OSFramework.Maps.OSStructures.OSMap.Coordinates {
			const center = this.provider.get('center');
			if (center === undefined) {
				OSFramework.Maps.Helper.ThrowError(
					this.map,
					OSFramework.Maps.Enum.ErrorCodes.API_FailedGettingShapeCenter
				);
			}

			return center.toJSON();
		}

		public get providerEventsList(): Array<string> {
			return Constants.Shape.ProviderCircleEvents;
		}

		public get providerObjectListener(): google.maps.Circle {
			return this.provider;
		}

		public get providerRadius(): number {
			const center = this.provider.get('radius');
			if (center === undefined) {
				OSFramework.Maps.Helper.ThrowError(
					this.map,
					OSFramework.Maps.Enum.ErrorCodes.API_FailedGettingShapeRadius
				);
			}

			return center;
		}

		public get shapeTag(): string {
			return OSFramework.Maps.Helper.Constants.shapeCircleTag;
		}

		public build(): void {
			super.build();
			// First build center coordinates based on the location
			// Then, create the provider (Google maps Shape)
			const shapeCenter = this._buildCenter(this.config.center);
			super._buildProvider(shapeCenter);
		}

		public changeProperty(propertyName: string, propertyValue: unknown): void {
			const propValue = OSFramework.Maps.Enum.OS_Config_Shape[propertyName];
			super.changeProperty(propertyName, propertyValue);
			if (this.isReady) {
				switch (propValue) {
					case OSFramework.Maps.Enum.OS_Config_Shape.center:
						this._changeCenter(propertyValue as string);
						return;
					case OSFramework.Maps.Enum.OS_Config_Shape.radius:
						return this.provider.setRadius(propertyValue as number);
					case OSFramework.Maps.Enum.OS_Config_Shape.fillColor:
					case OSFramework.Maps.Enum.OS_Config_Shape.fillOpacity:
						return this.provider.set(propertyName, propertyValue);
				}
			}
		}
	}
}
