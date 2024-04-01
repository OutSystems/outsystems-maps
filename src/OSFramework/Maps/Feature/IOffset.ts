// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace OSFramework.Maps.Feature {
	export interface IOffset {
		/** Sets the current Offset of the Map
		 * Get the OffsetX(vertical) and OffsetY(horizontal) in pixels, to apply on map. This will apply based on defined Location.
		 */
		getOffset: OSStructures.OSMap.Offset;
		/** Sets the current Offset of the Map
		 * Set the OffsetX(vertical) and OffsetY(horizontal) in pixels, to apply on map. This will apply based on defined Location.
		 * @param value Structure containing the OffsetX and OffsetY. (E.g. {OffsetX: 100, OffsetY: 100})
		 */
		setOffset(value: OSStructures.OSMap.Offset): void;
	}
}
