/// <reference path="AbstractDrawShape.ts" />

// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace Provider.Maps.Leaflet.DrawingTools {
    export class DrawRectangle extends AbstractDrawShape<Configuration.DrawingTools.DrawFilledShapeConfig> {
        constructor(
            map: OSFramework.Maps.OSMap.IMap,
            drawingTools: OSFramework.Maps.DrawingTools.IDrawingTools,
            drawingToolsId: string,
            type: string,
            configs: Configuration.DrawingTools.DrawFilledShapeConfig
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
            shape: L.Rectangle,
            configs: Configuration.Shape.RectangleShapeConfig
        ): Configuration.Shape.RectangleShapeConfig {
            const providerBounds = shape.getBounds();
            const bounds: OSFramework.Maps.OSStructures.OSMap.BoundsString = {
                north: providerBounds.getNorthEast().lat.toString(),
                south: providerBounds.getSouthWest().lat.toString(),
                west: providerBounds.getSouthWest().lng.toString(),
                east: providerBounds.getNorthEast().lng.toString()
            };

            // Join both the configs that were provided for the new shape element and the location that was provided by the DrawingTools shapecomplete event
            const finalConfigs = {
                ...configs,
                bounds: JSON.stringify(bounds)
            };
            return finalConfigs as Configuration.Shape.RectangleShapeConfig;
        }

        /** Get the constant for the event polygoncomplete */
        protected get completedToolEventName(): string {
            return OSFramework.Maps.Helper.Constants.drawingRectangleCompleted;
        }

        //TODO: create structure for rectangle options
        // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
        public get options(): any {
            return this.internalOptions;
        }

        //TODO: create structure for rectangle options
        // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
        protected set options(options: any) {
            const allOptions = { ...this.options, ...options };
            const shapeOptions = {
                ...this.options?.shapeOptions,
                ...options.shapeOptions
            };
            allOptions.shapeOptions = shapeOptions;
            this.drawingTools.provider.setDrawingOptions({
                rectangle: allOptions
            });
            this.internalOptions = allOptions;
        }

        protected createElement(
            uniqueId: string,
            shape: L.Rectangle,
            configs: Configuration.Shape.RectangleShapeConfig
        ): OSFramework.Maps.Shape.IShape {
            const finalConfigs = this._createConfigsElement(shape, configs);

            return super.createShapeElement(
                uniqueId,
                OSFramework.Maps.Enum.ShapeType.Rectangle,
                finalConfigs
            );
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
