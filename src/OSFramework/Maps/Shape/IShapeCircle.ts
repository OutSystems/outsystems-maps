// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace OSFramework.Maps.Shape {
	export interface IShapeCircle extends IShape {
		/** Center from the current shape */
		providerCenter: OSStructures.OSMap.Coordinates;
		/** Radius from the current shape (circle shape) */
		providerRadius: number;
	}
}
