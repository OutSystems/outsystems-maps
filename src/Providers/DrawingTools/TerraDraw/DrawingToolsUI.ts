// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace Provider.DrawingTools.TerraDraw {
	const _cssToolbar = 'os-terradraw-toolbar';
	const _cssButton = 'os-terradraw-btn';
	const _cssButtonActive = 'os-terradraw-btn--active';
	const _cssButtonIcon = 'os-terradraw-btn__icon';
	const _cssMapPositioned = 'os-terradraw-map-positioned';

	/** Maps TerraDraw mode name → human-readable accessible label */
	const _modeLabels: Record<string, string> = {
		[Constants.ModeName.Marker]: 'Marker',
		[Constants.ModeName.LineString]: 'Polyline',
		[Constants.ModeName.Polygon]: 'Polygon',
		[Constants.ModeName.Circle]: 'Circle',
		[Constants.ModeName.Rectangle]: 'Rectangle',
	};

	/** Maps OS position string → toolbar BEM modifier class */
	const _positionClasses: Record<string, string> = {
		TOP_LEFT: `${_cssToolbar}--top-left`,
		TOP_CENTER: `${_cssToolbar}--top-center`,
		TOP_RIGHT: `${_cssToolbar}--top-right`,
		LEFT_TOP: `${_cssToolbar}--left-top`,
		LEFT_CENTER: `${_cssToolbar}--left-center`,
		LEFT_BOTTOM: `${_cssToolbar}--left-bottom`,
		RIGHT_TOP: `${_cssToolbar}--right-top`,
		RIGHT_CENTER: `${_cssToolbar}--right-center`,
		RIGHT_BOTTOM: `${_cssToolbar}--right-bottom`,
		BOTTOM_LEFT: `${_cssToolbar}--bottom-left`,
		BOTTOM_CENTER: `${_cssToolbar}--bottom-center`,
		BOTTOM_RIGHT: `${_cssToolbar}--bottom-right`,
	};

	/**
	 * Builds and manages the Drawing Tools floating toolbar DOM element.
	 * Owned and lifecycle-managed by DrawingTools.
	 * Communicates back via injected callbacks — never holding a reference to the TerraDraw instance directly.
	 */
	export class DrawingToolsUi {
		private _activeButton: HTMLButtonElement | null;
		private _activeMode: string | null;
		private _container: HTMLElement;
		private readonly _mapContainer: HTMLElement;
		private readonly _onModeDeselect: () => void;
		private readonly _onModeSelect: (modeName: string) => void;
		private _selectButton: HTMLButtonElement;

		constructor(mapContainer: HTMLElement, onModeSelect: (modeName: string) => void, onModeDeselect: () => void) {
			this._mapContainer = mapContainer;
			this._onModeSelect = onModeSelect;
			this._onModeDeselect = onModeDeselect;
			this._activeButton = null;
			this._activeMode = null;
		}

		private _applyPosition(position: string): void {
			const cls = _positionClasses[position] ?? _positionClasses['TOP_LEFT'];
			this._container.classList.add(cls);
		}

		private _clearActive(): void {
			if (this._activeButton) {
				this._activeButton.classList.remove(_cssButtonActive);
				this._activeButton.setAttribute('aria-checked', 'false');
				this._activeButton = null;
			}
			this._activeMode = null;
		}

		private _createButton(modeName: string, ariaLabel: string): HTMLButtonElement {
			const btn = document.createElement('button');
			btn.type = 'button';
			btn.className = _cssButton;
			btn.dataset.mode = modeName;
			btn.title = ariaLabel;
			btn.setAttribute('role', 'menuitemradio');
			btn.setAttribute('aria-label', ariaLabel);
			btn.setAttribute('aria-checked', 'false');

			const icon = document.createElement('span');
			icon.className = _cssButtonIcon;
			icon.setAttribute('aria-hidden', 'true');
			btn.appendChild(icon);

			btn.addEventListener('click', () => this._handleClick(btn, modeName));
			return btn;
		}

		/**
		 * Clicking an already-active drawing tool deactivates it (toggling back to
		 * select mode) so the user can cancel an in-progress draw without leaving
		 * the toolbar. Clicking the select button explicitly also routes here.
		 */
		private _handleClick(btn: HTMLButtonElement, modeName: string): void {
			if (this._activeMode === modeName || modeName === Constants.ModeName.Select) {
				this._setActive(this._selectButton, Constants.ModeName.Select);
				this._onModeDeselect();
			} else {
				this._setActive(btn, modeName);
				this._onModeSelect(modeName);
			}
		}

		private _setActive(btn: HTMLButtonElement, modeName: string): void {
			this._clearActive();
			btn.classList.add(_cssButtonActive);
			btn.setAttribute('aria-checked', 'true');
			this._activeButton = btn;
			this._activeMode = modeName;
		}

		public build(toolModeNames: string[], position: string): void {
			this._container = document.createElement('div');
			this._container.className = _cssToolbar;
			this._container.setAttribute('role', 'menubar');
			this._applyPosition(position);

			// Adding the select button to the toolbar
			this._selectButton = this._createButton(Constants.ModeName.Select, 'Stop drawing');
			this._container.appendChild(this._selectButton);

			toolModeNames.forEach((mode) => {
				const ariaLabel =
					mode === Constants.ModeName.Marker ? 'Add a marker' : `Draw a ${_modeLabels[mode] ?? mode}`;
				this._container.appendChild(this._createButton(mode, ariaLabel));
			});

			// Ensure the map container is a positioning context via class (avoids inline style / CSP issues)
			this._mapContainer.classList.add(_cssMapPositioned);
			this._mapContainer.appendChild(this._container);
			this.setDefaultMode();
		}

		/** Removes the toolbar from the DOM and resets state. */
		public dispose(): void {
			if (this._container?.parentNode) {
				this._container.remove();
			}
			this._container = undefined;
			this._activeButton = undefined;
			this._activeMode = undefined;
			this._selectButton = undefined;
		}

		/**
		 * Destroys and rebuilds the toolbar with an updated tool list.
		 * @param toolModeNames Updated list of TerraDraw mode names.
		 * @param position OS position string.
		 */
		public refresh(toolModeNames: string[], position: string): void {
			this.dispose();
			this.build(toolModeNames, position);
		}

		public setDefaultMode(): void {
			if (this._selectButton) {
				this._setActive(this._selectButton, Constants.ModeName.Select);
			}
		}
	}
}
