/// <reference path="AbstractProviderShape.ts" />

// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace Provider.Maps.Google.Shape {
	export abstract class AbstractPolyshape<
		T extends OSFramework.Maps.Configuration.IConfigurationShape,
		W extends google.maps.Polygon | google.maps.Polyline,
	> extends AbstractProviderShape<T, W> {
		private _buildPath(loc: string): Promise<Array<OSFramework.Maps.OSStructures.OSMap.Coordinates>> {
			// If the Shape doesn't have the minimum valid address/coordinates, then throw an error
			if (this._validateLocations(loc)) {
				const _locations = JSON.parse(loc);
				// Let's return a promise that will be resolved or rejected according to the result
				return new Promise((resolve, reject) => {
					const shapePath: Map<number, OSFramework.Maps.OSStructures.OSMap.Coordinates> = new Map();

					// As soon as one location from the locations input is not valid:
					// Is not a string / Is empty
					// Throw an error for invalid Locations
					_locations.every((location: string, index: number) => {
						// Make sure the current location from the array of locations is not empty
						if (OSFramework.Maps.Helper.IsEmptyString(location)) {
							OSFramework.Maps.Helper.ThrowError(this.map, this.invalidShapeLocationErrorCode);
							return false;
						}

						Helper.Conversions.ConvertToCoordinates(location)
							.then((response) => {
								shapePath.set(index, {
									lat: response.lat,
									lng: response.lng,
								});
								if (shapePath.size === _locations.length) {
									resolve(
										// This method is async
										// We need to make sure the path is sorted correctly when all coordinates are retrieved
										Array.from(shapePath.keys())
											.sort((a, b) => a - b)
											.map((key) => shapePath.get(key))
									);
								}
							})
							.catch((e) => reject(e));
						return true;
					});
				});
			}
		}

		/** Validates if the locations are accepted for the Shape's path considering the minimum valid address/coordinates */
		private _validateLocations(loc: string): boolean {
			if (OSFramework.Maps.Helper.IsEmptyString(loc) || JSON.parse(loc).length < this.minPath) {
				OSFramework.Maps.Helper.ThrowError(this.map, this.invalidShapeLocationErrorCode);
				return false;
			}
			return true;
		}

		protected _setProviderPath(path: Array<OSFramework.Maps.OSStructures.OSMap.Coordinates>): void {
			this._provider.setPath(path as google.maps.LatLngLiteral[]);
		}

		public get providerBounds(): google.maps.LatLngBounds {
			const bounds = new google.maps.LatLngBounds();
			this.providerPath.forEach(function (item) {
				bounds.extend(new google.maps.LatLng(item.lat as number, item.lng as number));
			});
			return bounds;
		}

		public get providerEventsList(): Array<string> {
			return Constants.Shape.ProviderPolyshapeEvents;
		}

		public get providerObjectListener(): google.maps.MVCArray<unknown> {
			return this.provider.getPath();
		}

		public get providerPath(): Array<OSFramework.Maps.OSStructures.OSMap.Coordinates> {
			const path = this.provider.getPath();
			if (path === undefined) {
				OSFramework.Maps.Helper.ThrowError(
					this.map,
					OSFramework.Maps.Enum.ErrorCodes.API_FailedGettingShapePath
				);
				return [];
			}

			return path.getArray().map((coords: google.maps.LatLng) => coords.toJSON());
		}

		public build(): void {
			super.build();

			const shapePath = this._buildPath(this.config.locations);
			this._buildProvider(shapePath);
		}

		public changeProperty(propertyName: string, propertyValue: unknown): void {
			const propValue = OSFramework.Maps.Enum.OS_Config_Shape[propertyName];
			super.changeProperty(propertyName, propertyValue);
			if (this.isReady) {
				switch (propValue) {
					case OSFramework.Maps.Enum.OS_Config_Shape.locations:
						// eslint-disable-next-line no-case-declarations
						const shapePath = this._buildPath(propertyValue as string);
						// If path is undefined (should be a promise) -> don't create the shape
						if (shapePath !== undefined) {
							shapePath
								.then((path) => {
									this._setProviderPath(path);
								})
								.catch((error) => {
									OSFramework.Maps.Helper.ThrowError(
										this.map,
										OSFramework.Maps.Enum.ErrorCodes.LIB_FailedGeocodingShapeLocations,
										error
									);
								});
						}
						return;
					case OSFramework.Maps.Enum.OS_Config_Shape.fillColor:
					case OSFramework.Maps.Enum.OS_Config_Shape.fillOpacity:
						return this.provider.set(propertyName, propertyValue);
				}
			}
		}

		protected abstract _createProvider(path: Array<OSFramework.Maps.OSStructures.OSMap.Coordinates>): W;

		public abstract get shapeTag(): string;
	}
}
