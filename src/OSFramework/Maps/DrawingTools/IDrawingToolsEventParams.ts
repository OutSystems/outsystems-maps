// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace OSFramework.Maps.DrawingTools {
	export interface IDrawingToolsEventParams {
		coordinates: string;
		isNewElement: boolean;
		location: string | string[];
		uniqueId: string;
	}
}
