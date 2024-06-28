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

		// Events no longer supported by Google Maps Advanced Marker API \\
		// animation_changed = 'animation_changed',
		// clickable_changed = 'clickable_changed',
		// contextmenu = 'contextmenu',
		// cursor_changed = 'cursor_changed',
		// draggable_changed = 'draggable_changed',
		// flat_changed = 'flat_changed',
		// icon_changed = 'icon_changed',
		// position_changed = 'position_changed',
		// shape_changed = 'shape_changed',
		// title_changed = 'title_changed',
		// visible_changed = 'visible_changed',
		// zindex_changed = 'zindex_changed',
	}

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
