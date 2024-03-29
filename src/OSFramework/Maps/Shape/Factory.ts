// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace OSFramework.Maps.Shape {
	export namespace ShapeFactory {
		export function MakeShape(
			map: OSMap.IMap,
			shapeId: string,
			type: Enum.ShapeType,
			configs: Configuration.IConfigurationShape
		): Shape.IShape {
			switch (map.providerType) {
				case Enum.ProviderType.Google:
					// eslint-disable-next-line @typescript-eslint/no-unused-vars
					return Provider.Maps.Google.Shape.ShapeFactory.MakeShape(map, shapeId, type, configs);
				case Enum.ProviderType.Leaflet:
					return Provider.Maps.Leaflet.Shape.ShapeFactory.MakeShape(map, shapeId, type, configs);
				default:
					throw new Error(`There is no factory for the Shape using the provider ${map.providerType}`);
			}
		}
	}
}
