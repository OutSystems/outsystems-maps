// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace Provider.Maps.Google.Shape {
    export namespace ShapeFactory {
        export function MakeShape(
            map: OSFramework.Maps.OSMap.IMap,
            shapeId: string,
            type: OSFramework.Maps.Enum.ShapeType,
            configs: JSON
        ): OSFramework.Maps.Shape.IShape {
            switch (type) {
                case OSFramework.Maps.Enum.ShapeType.Polygon:
                    return new Polygon(map, shapeId, type, configs);
                case OSFramework.Maps.Enum.ShapeType.Polyline:
                    return new Polyline(map, shapeId, type, configs);
                case OSFramework.Maps.Enum.ShapeType.Circle:
                    return new Circle(map, shapeId, type, configs);
                case OSFramework.Maps.Enum.ShapeType.Rectangle:
                    return new Rectangle(map, shapeId, type, configs);
                default:
                    throw new Error(
                        `There is no factory for this type of Shape (${type})`
                    );
            }
        }
    }
}
