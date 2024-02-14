/// <reference path="AbstractProviderTool.ts" />

// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace Provider.Maps.Leaflet.DrawingTools {
	export abstract class AbstractDrawShape<
		W extends Configuration.DrawingTools.DrawConfig,
	> extends AbstractProviderTool<W> {
		constructor(
			map: OSFramework.Maps.OSMap.IMap,
			drawingTools: OSFramework.Maps.DrawingTools.IDrawingTools,
			drawingToolsId: string,
			type: string,
			configs: W
		) {
			super(map, drawingTools, drawingToolsId, type, configs);
		}

		/** Add the onChange event to the new element */
		private _setOnChangeEvent(_shape: OSFramework.Maps.Shape.IShape): void {
			_shape.shapeEvents.addHandler(
				// changing the shape locations or bounds is only available via the drag-and-drop and resize, so the solution passes by adding the shape_changed event listener as the shape's OnChanged event
				OSFramework.Maps.Helper.Constants.shapeChangedEvent as OSFramework.Maps.Event.Shape.ShapeEventType,
				(
					mapId: string,
					shapeId: string,
					eventName: string,
					shapeCoordinates: OSFramework.Maps.OSStructures.OSMap.OSShapeCoordinates
				) => {
					const dtparams: OSFramework.Maps.DrawingTools.IDrawingToolsEventParams = {
						uniqueId: _shape.uniqueId,
						isNewElement: false,
						location: JSON.stringify(shapeCoordinates.location),
						coordinates: JSON.stringify(shapeCoordinates.coordinates),
					};

					this.drawingTools.drawingToolsEvents.trigger(
						// EventType
						OSFramework.Maps.Event.DrawingTools.DrawingToolsEventType.ProviderEvent,
						// EventName
						this.completedToolEventName,
						// The extra parameters, uniqueId and isNewElement set to false indicating that the element is not new
						dtparams
					);
				}
			);
		}

		/** Create the new shape element based on the configurations (already contains the locations, the bounds or the center and radius depending on the type of the new shape) */
		protected createShapeElement(
			uniqueId: string,
			type: OSFramework.Maps.Enum.ShapeType,
			configs: OSFramework.Maps.Configuration.IConfigurationShape
		): OSFramework.Maps.Shape.IShape {
			const _shape = Shape.ShapeFactory.MakeShape(this.map, uniqueId, type, configs);

			// Add the onChange event to the new element
			this._setOnChangeEvent(_shape);
			// Add the new element to the map
			this.map.addShape(_shape);
			return _shape;
		}

		protected getCoordinates(): string {
			const locations = JSON.parse(this.newElm.config.locations);
			const locationsArray = [];

			for (const coord of locations) {
				locationsArray.push(coord.toString().split(','));
			}

			const finalLocations = locationsArray.map((coords: OSFramework.Maps.OSStructures.OSMap.Coordinates) => {
				return { Lat: coords[0], Lng: coords[1] };
			});

			return JSON.stringify(finalLocations);
		}

		protected getLocation(): string {
			return this.newElm.config.locations;
		}

		public build(): void {
			super.build();

			this.options = this.getProviderConfig();
		}

		public changeProperty(propertyName: string, propertyValue: unknown): void {
			const propValue = OSFramework.Maps.Enum.OS_Config_Shape[propertyName];
			super.changeProperty(propertyName, propertyValue);
			if (this.drawingTools.isReady) {
				switch (propValue) {
					// If the following configurations are not included on the configs of the tool, the AbstractTool will make sure to throw an error
					case OSFramework.Maps.Enum.OS_Config_Shape.strokeOpacity:
						this.options = {
							shapeOptions: { opacity: propertyValue },
						};
						return;
					case OSFramework.Maps.Enum.OS_Config_Shape.strokeColor:
						this.options = {
							shapeOptions: { color: propertyValue },
						};
						return;
					case OSFramework.Maps.Enum.OS_Config_Shape.strokeWeight:
						this.options = {
							shapeOptions: { weight: propertyValue },
						};
						return;
					case OSFramework.Maps.Enum.OS_Config_Shape.fillOpacity:
						this.options = {
							shapeOptions: { fillOpacity: propertyValue },
						};
						return;
					case OSFramework.Maps.Enum.OS_Config_Shape.fillColor:
						this.options = {
							shapeOptions: { fillColor: propertyValue },
						};
						return;
				}
			}
		}
	}
}
