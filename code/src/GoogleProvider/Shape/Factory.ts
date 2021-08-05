// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace GoogleProvider.Shape {
    export namespace ShapeFactory {
        export function MakeShape(
            map: OSFramework.OSMap.IMap,
            shapeId: string,
            type: OSFramework.Enum.ShapeType,
            configs: OSFramework.Configuration.IConfiguration
        ): OSFramework.Shape.IShape {
            switch (type) {
                case OSFramework.Enum.ShapeType.Polyline:
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    return new Polyline(
                        map,
                        shapeId,
                        type,
                        configs as Configuration.Shape.GoogleShapeConfig
                    );
                default:
                    throw `There is no factory for this type of Shape (${type})`;
            }
        }
    }
}
