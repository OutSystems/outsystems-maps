// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace Provider.Maps.Google.Constants.Marker {
	/**
	 * Enum that defines the available Provider Events
	 */
	export enum ProviderEventNames {
		click = 'click',
		drag = 'drag',
		dragend = 'dragend',
		dragstart = 'dragstart',
	}

	/**
	 * Enum that defines the events made available to replace the missing ones in the provider
	 */
	export enum ProviderEventNamesHtml {
		auxclick = 'auxclick',
		contextmenu = 'auxclick', // eslint-disable-line @typescript-eslint/no-duplicate-enum-values
		dblclick = 'dblclick',
		mousedown = 'mousedown',
		mouseout = 'mouseout',
		mouseover = 'mouseover',
		mouseup = 'mouseup',
		rightclick = 'auxclick', // eslint-disable-line @typescript-eslint/no-duplicate-enum-values
	}
}
