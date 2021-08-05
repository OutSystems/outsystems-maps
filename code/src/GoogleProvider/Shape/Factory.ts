// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace GoogleProvider.Shape {
    export namespace ShapeFactory {
        export function MakeShape(
            map: OSFramework.OSMap.IMap,
            shapeId: string,
            type: OSFramework.Enum.ShapeType,
            configs: JSON
        ): OSFramework.Shape.IShape {
            switch (type) {
                case OSFramework.Enum.ShapeType.Polygon:
                    return new Polygon(map, shapeId, type, configs);
                case OSFramework.Enum.ShapeType.Polyline:
                    return new Polyline(map, shapeId, type, configs);

                default:
                    throw `There is no factory for this type of Shape (${type})`;
            }
        }
    }
}
