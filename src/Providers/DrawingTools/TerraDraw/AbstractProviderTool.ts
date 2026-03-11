/// <reference path="../../../OSFramework/Maps/DrawingTools/AbstractTool.ts" />

// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace Provider.DrawingTools.TerraDraw {
	export abstract class AbstractProviderTool<
		T extends OSFramework.Maps.Configuration.IConfigurationTool,
	> extends OSFramework.Maps.DrawingTools.AbstractTool<T> {
		protected newElm: unknown;

		/**
		 * Triggers the OnDrawingChange framework event for this tool.
		 * @param uniqueId Id of the newly created or modified OS element.
		 * @param isNewElement true when the element was just drawn; false on edit.
		 * @param coordinates JSON-encoded coordinate object(s).
		 * @param location JSON-encoded location string(s) suitable for a Shape block.
		 */
		protected triggerOnDrawingChangeEvent(
			uniqueId: string,
			isNewElement: boolean,
			coordinates: string,
			location: string | string[]
		): void {
			this.drawingTools.drawingToolsEvents.trigger(
				OSFramework.Maps.Event.DrawingTools.DrawingToolsEventType.ProviderEvent,
				this.completedToolEventName,
				{ uniqueId, isNewElement, coordinates, location }
			);
		}

		// ─── Public methods (alphabetical) ─────────────────────────────────────────

		/**
		 * No-op for TerraDraw tools.
		 * Events are centralised in DrawingTools and dispatched via handleFinish.
		 */
		public addCompletedEvent(): void {
			// Intentionally empty — TerraDraw routes finish events through DrawingTools
		}

		public build(): void {
			super.build();
			this.finishBuild();
		}

		public changeProperty(propertyName: string, value: unknown): void {
			super.changeProperty(propertyName, value);
			if (this.drawingTools.isReady) {
				this.applyStyleChange(propertyName, value);
			}
		}

		/**
		 * Called by DrawingTools when TerraDraw fires a finish event with action='draw'.
		 * Creates the OS element, records it, and fires the framework event.
		 */
		public handleFinish(feature: TerraDrawGeoJSONFeature): void {
			const uniqueId = OSFramework.Maps.Helper.GenerateUniqueId();
			this.newElm = this.createElement(uniqueId, feature, this.config);
			this.drawingTools.createdElements.push(this.newElm);

			const coordinates = this.getCoordinates(feature);
			const location = this.getLocation(feature);
			this.triggerOnDrawingChangeEvent(uniqueId, true, coordinates, location);
		}

		/**
		 * Subclasses override this to map an OS property change to a TerraDraw mode option update.
		 */
		protected abstract applyStyleChange(_propertyName: string, _value: unknown): void;

		/** Framework event name for when this tool completes (e.g. 'circlecomplete'). */
		protected abstract get completedToolEventName(): string;

		/**
		 * Creates the OS framework element from a completed TerraDraw GeoJSON feature.
		 * @param uniqueId Framework-generated unique ID for the new element.
		 * @param feature GeoJSON feature from TerraDraw's store snapshot.
		 * @param configs Tool configuration at the time of creation.
		 */
		protected abstract createElement(uniqueId: string, feature: TerraDrawGeoJSONFeature, configs: T): unknown;

		/**
		 * Instantiates the corresponding TerraDraw mode with styles from this tool's config.
		 * Called by DrawingTools during TerraDraw instance construction.
		 */
		public abstract createTerraDrawMode(): TerraDrawBaseDrawMode;

		/** Returns a JSON-encoded coordinate object (or array) for the framework event. */
		protected abstract getCoordinates(feature: TerraDrawGeoJSONFeature): string;

		/** Returns a JSON-encoded location string (or string array) for the framework event. */
		protected abstract getLocation(feature: TerraDrawGeoJSONFeature): string | string[];

		/**
		 * The options object for the TerraDraw mode, derived from the tool's config.
		 */
		public abstract get options(): unknown;

		/** The mode name used by TerraDraw (e.g. 'circle', 'polygon', 'linestring'). */
		public abstract get terraDrawModeName(): string;
	}
}
