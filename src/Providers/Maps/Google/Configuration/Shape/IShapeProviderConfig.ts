// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace Provider.Maps.Google.Configuration.Shape {
	export interface IShapeProviderConfig {
		clickable: boolean;
		draggable: boolean;
		editable: boolean;
		fillColor?: string;
		fillOpacity?: number;
		locations?: string;
		radius?: number;
		strokeColor: string;
		strokeOpacity: number;
		strokeWeight: number;
	}
}
