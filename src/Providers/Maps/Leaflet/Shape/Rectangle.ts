/// <reference path="AbstractProviderShape.ts" />

// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace Provider.Maps.Leaflet.Shape {
	export class Rectangle
		extends AbstractProviderShape<Configuration.Shape.RectangleShapeConfig, L.Rectangle>
		implements OSFramework.Maps.Shape.IShapeRectangle
	{
		constructor(
			map: OSFramework.Maps.OSMap.IMap,
			shapeId: string,
			type: OSFramework.Maps.Enum.ShapeType,
			configs: OSFramework.Maps.Configuration.IConfigurationShape
		) {
			super(map, shapeId, type, new Configuration.Shape.RectangleShapeConfig(configs));
		}

		protected get invalidShapeLocationErrorCode(): OSFramework.Maps.Enum.ErrorCodes {
			return OSFramework.Maps.Enum.ErrorCodes.CFG_InvalidRectangleShapeBounds;
		}

		public get bounds(): OSFramework.Maps.OSStructures.OSMap.Bounds {
			const bounds = new OSFramework.Maps.OSStructures.OSMap.Bounds();

			// Map providerBounds into OSFramework bounds structure
			bounds.east = this.providerBounds.getNorthEast().lng;
			bounds.north = this.providerBounds.getNorthEast().lat;
			bounds.west = this.providerBounds.getSouthWest().lng;
			bounds.south = this.providerBounds.getSouthWest().lat;
			return bounds;
		}

		public get providerBounds(): L.LatLngBounds {
			return this.provider.getBounds();
		}

		public get providerEventsList(): Array<string> {
			return Constants.Shape.ProviderRectangleEvents;
		}

		public get shapeTag(): string {
			return OSFramework.Maps.Helper.Constants.shapeRectangleTag;
		}

		// From the structure Bounds (north, south, east, weast) we need to convert the locations into the correct format of bounds
		// For instance (north: string -> north: number)
		private _buildBounds(boundsString: string): Promise<OSFramework.Maps.OSStructures.OSMap.Bounds> {
			const bounds: OSFramework.Maps.OSStructures.OSMap.BoundsString = JSON.parse(boundsString);
			// If the Shape doesn't have the minimum valid address/coordinates, then throw an error
			if (OSFramework.Maps.Helper.HasAnyEmptyBound(bounds)) {
				OSFramework.Maps.Helper.ThrowError(this.map, this.invalidShapeLocationErrorCode);
				return;
			}

			// make sure the provided bounds (string) have the correct format
			// this method will then return a promise that will be resolved on the _buildProvider
			return this._convertStringToBounds(bounds);
		}

		/**
		 * This method will help converting the bounds (string) into the respective coordinates that will be used on the bounds
		 * It returns a promise because bounds will get converted into coordinates
		 * The method resposible for this conversion (Helper.Conversions.ValidateCoordinates) also returns a Promise
		 * This Promise will only get resolved after the provider gets built (asynchronously)
		 */
		private _convertStringToBounds(
			bounds: OSFramework.Maps.OSStructures.OSMap.BoundsString
		): Promise<OSFramework.Maps.OSStructures.OSMap.Bounds> {
			const cardinalDirections = ['north', 'south', 'east', 'west'];
			return new Promise((resolve, reject) => {
				let boundsLength = 0;
				const newBounds = new OSFramework.Maps.OSStructures.OSMap.Bounds();
				cardinalDirections.forEach((cd) => {
					// Regex that validates if string is a coordinate (latitude or longitude)
					const regexValidator = /^-{0,1}\d*\.{0,1}\d*$/;
					if (regexValidator.test(bounds[cd])) {
						boundsLength++;
						newBounds[cd] = parseFloat(bounds[cd]);
						if (boundsLength === 4) {
							resolve(newBounds);
						}
					} else {
						Helper.Conversions.ValidateCoordinates(bounds[cd])
							.then((response) => {
								boundsLength++;
								switch (cd) {
									case 'north':
									case 'south':
										newBounds[cd] = response.lat;
										break;
									case 'east':
									case 'west':
									default:
										newBounds[cd] = response.lng;
										break;
								}
								if (boundsLength === 4) {
									resolve(newBounds);
								}
							})
							.catch((e) => reject(e));
					}
				});
			});
		}

		protected createProvider(bounds: OSFramework.Maps.OSStructures.OSMap.Bounds): L.Rectangle {
			const providerBounds: L.LatLngBoundsExpression = [
				[bounds.south, bounds.west],
				[bounds.north, bounds.east],
			];
			return new L.Rectangle(providerBounds, {
				...(this.getProviderConfig() as L.PolylineOptions),
			});
		}

		protected getShapeCoordinates(): OSFramework.Maps.OSStructures.OSMap.RectangleCoordinates {
			const bounds = {
				north: this.bounds.north,
				south: this.bounds.south,
				west: this.bounds.west,
				east: this.bounds.east,
			};
			return {
				location: bounds,
				coordinates: bounds,
			};
		}

		public build(): void {
			super.build();

			// First build the bounds with the coordinates
			// Then, create the provider (Leaflet Shape)
			const bounds = this._buildBounds(this.config.bounds);
			super.buildProvider(bounds);
		}

		public changeProperty(propertyName: string, propertyValue: unknown): void {
			const propValue = OSFramework.Maps.Enum.OS_Config_Shape[propertyName];
			super.changeProperty(propertyName, propertyValue);
			if (this.isReady) {
				switch (propValue) {
					case OSFramework.Maps.Enum.OS_Config_Shape.fillColor:
						this.provider.setStyle({
							fillColor: propertyValue as string,
						});
						return;
					case OSFramework.Maps.Enum.OS_Config_Shape.fillOpacity:
						this.provider.setStyle({
							fillOpacity: propertyValue as number,
						});
						return;
					case OSFramework.Maps.Enum.OS_Config_Shape.bounds:
						// eslint-disable-next-line no-case-declarations
						const shapeBounds = this._buildBounds(propertyValue as string);
						// If path is undefined (should be a promise) -> don't create the shape
						if (shapeBounds !== undefined) {
							shapeBounds
								.then((bounds) => {
									const providerBounds: L.LatLngBoundsExpression = [
										[bounds.south, bounds.west],
										[bounds.north, bounds.east],
									];
									this.provider.setBounds(providerBounds);
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
				}
			}
		}
	}
}
