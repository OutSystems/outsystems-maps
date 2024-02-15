/// <reference path="AbstractDrawShape.ts" />

// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace Provider.Maps.Google.DrawingTools {
	export class DrawRectangle extends AbstractDrawShape<Configuration.DrawingTools.DrawFilledShapeConfig> {
		constructor(
			map: OSFramework.Maps.OSMap.IMap,
			drawingTools: OSFramework.Maps.DrawingTools.IDrawingTools,
			drawingToolsId: string,
			type: string,
			configs: JSON
		) {
			super(
				map,
				drawingTools,
				drawingToolsId,
				type,
				new Configuration.DrawingTools.DrawFilledShapeConfig(configs)
			);
		}

		private _createConfigsElement(
			shape: google.maps.Rectangle,
			configs: Configuration.Shape.RectangleShapeConfig
		): Configuration.Shape.RectangleShapeConfig {
			const providerBounds = shape.getBounds();
			const bounds: OSFramework.Maps.OSStructures.OSMap.BoundsString = {
				north: providerBounds.getNorthEast().lat().toString(),
				south: providerBounds.getSouthWest().lat().toString(),
				west: providerBounds.getSouthWest().lng().toString(),
				east: providerBounds.getNorthEast().lng().toString(),
			};

			// Join both the configs that were provided for the new shape element and the location that was provided by the DrawingTools shapecomplete event
			const finalConfigs = {
				...configs,
				bounds: JSON.stringify(bounds),
			};
			return finalConfigs as Configuration.Shape.RectangleShapeConfig;
		}

		/** Get the constant for the event polygoncomplete */
		protected get completedToolEventName(): string {
			return OSFramework.Maps.Helper.Constants.drawingRectangleCompleted;
		}

		public get options(): google.maps.RectangleOptions {
			return this.drawingTools.provider.get('rectangleOptions');
		}

		protected set options(options: google.maps.RectangleOptions) {
			const allOptions = { ...this.options, ...options };
			this.drawingTools.provider.setOptions({
				rectangleOptions: allOptions,
			});
		}

		protected createElement(
			uniqueId: string,
			shape: google.maps.Rectangle,
			configs: Configuration.Shape.RectangleShapeConfig
		): OSFramework.Maps.Shape.IShape {
			const finalConfigs = this._createConfigsElement(shape, configs);

			return super.createShapeElement(uniqueId, OSFramework.Maps.Enum.ShapeType.Rectangle, finalConfigs);
		}

		/** Gets the bounds of the new rectangle, with the expected bound structure */
		protected getCoordinates(): string {
			const coordinates = JSON.parse(this.newElm.config.bounds);
			return JSON.stringify(coordinates);
		}

		/** Gets the location of the new shape (rectangle), as a string */
		protected getLocation(): string {
			return this.newElm.config.bounds;
		}
	}
}
