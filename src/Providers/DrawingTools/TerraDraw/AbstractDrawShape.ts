/// <reference path="AbstractProviderTool.ts" />

// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace Provider.DrawingTools.TerraDraw {
	export abstract class AbstractDrawShape<
		T extends Provider.Maps.Google.Configuration.DrawingTools.DrawConfig,
	> extends AbstractProviderTool<T> {
		/**
		 * Wires the OS shape's own change event so that post-creation edits
		 * (via Google Maps' native editable handles) also fire the framework event.
		 */
		private _setOnChangeEvent(shape: OSFramework.Maps.Shape.IShape): void {
			shape.shapeEvents.addHandler(
				OSFramework.Maps.Helper.Constants.shapeChangedEvent as OSFramework.Maps.Event.Shape.ShapeEventType,
				(
					_mapId: string,
					_shapeId: string,
					_eventName: string,
					shapeCoordinates: OSFramework.Maps.OSStructures.OSMap.OSShapeCoordinates
				) => {
					this.triggerOnDrawingChangeEvent(
						shape.uniqueId,
						false,
						JSON.stringify(shapeCoordinates.coordinates),
						JSON.stringify(shapeCoordinates.location)
					);
				}
			);
		}

		/**
		 * Instantiates the OS shape via the framework factory, wires the change event,
		 * and adds it to the map.
		 */
		protected createShapeElement(
			uniqueId: string,
			type: OSFramework.Maps.Enum.ShapeType,
			configs: unknown
		): OSFramework.Maps.Shape.IShape {
			const shape = Provider.Maps.Google.Shape.ShapeFactory.MakeShape(this.map, uniqueId, type, configs);
			this._setOnChangeEvent(shape);
			this.map.addShape(shape);
			return shape;
		}
	}
}