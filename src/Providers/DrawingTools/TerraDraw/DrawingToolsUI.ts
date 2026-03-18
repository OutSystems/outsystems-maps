// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace Provider.DrawingTools.TerraDraw {
	const _cssToolbar = 'os-terradraw-toolbar';
	const _cssButton = 'os-terradraw-btn';
	const _cssButtonActive = 'os-terradraw-btn--active';

	/** Maps TerraDraw mode name → human-readable button label */
	const _modeLabels: Record<string, string> = {
		marker: 'Marker',
		linestring: 'Polyline',
		polygon: 'Polygon',
		circle: 'Circle',
		rectangle: 'Rectangle',
	};

	/** Maps OS position string → CSS { top/bottom/left/right } values */
	const _positionStyles: Record<string, Partial<CSSStyleDeclaration>> = {
		TOP_LEFT: { top: '10px', left: '10px' },
		TOP_CENTER: { top: '10px', left: '50%', transform: 'translateX(-50%)' },
		TOP_RIGHT: { top: '10px', right: '10px' },
		LEFT_TOP: { top: '10px', left: '10px' },
		RIGHT_TOP: { top: '10px', right: '10px' },
		BOTTOM_LEFT: { bottom: '10px', left: '10px' },
		BOTTOM_CENTER: { bottom: '10px', left: '50%', transform: 'translateX(-50%)' },
		BOTTOM_RIGHT: { bottom: '10px', right: '10px' },
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
		private readonly _toolsOrder: string[];

		constructor(mapContainer: HTMLElement, onModeSelect: (modeName: string) => void, onModeDeselect: () => void) {
			this._mapContainer = mapContainer;
			this._onModeSelect = onModeSelect;
			this._onModeDeselect = onModeDeselect;
			this._activeButton = null;
			this._activeMode = null;
			this._toolsOrder = Object.keys(_modeLabels);
		}

		private _applyPosition(position: string): void {
			const styles = _positionStyles[position] ?? _positionStyles['TOP_LEFT'];
			Object.assign(this._container.style, styles);
		}

		private _clearActive(): void {
			if (this._activeButton) {
				this._activeButton.classList.remove(_cssButtonActive);
				this._activeButton = null;
			}
			this._activeMode = null;
		}

		private _createButton(modeName: string): HTMLButtonElement {
			const btn = document.createElement('button');
			btn.type = 'button';
			btn.className = _cssButton;
			btn.dataset.mode = modeName;
			btn.title = modeName;
			btn.textContent = _modeLabels[modeName] ?? modeName;
			btn.addEventListener('click', () => this._handleClick(btn, modeName));
			return btn;
		}

		private _handleClick(btn: HTMLButtonElement, modeName: string): void {
			if (this._activeMode === modeName) {
				this._clearActive();
				this._onModeDeselect();
			} else {
				this._setActive(btn, modeName);
				this._onModeSelect(modeName);
			}
		}

		private _setActive(btn: HTMLButtonElement, modeName: string): void {
			this._clearActive();
			btn.classList.add(_cssButtonActive);
			this._activeButton = btn;
			this._activeMode = modeName;
		}

		/** Removes any active button highlight without firing the deselect callback. */
		public build(toolModeNames: string[], position: string): void {
			this._container = document.createElement('div');
			this._container.className = _cssToolbar;
			this._container.style.position = 'absolute';
			this._container.style.zIndex = '1000';
			this._applyPosition(position);

			const appendAll = this._toolsOrder.length === toolModeNames.length;
			this._toolsOrder.forEach((mode) => {
				if (appendAll || toolModeNames.includes(mode)) {
					this._container.appendChild(this._createButton(mode));
				}
			});

			// Ensure the map container is a positioning context
			const currentPosition = globalThis.getComputedStyle(this._mapContainer).position;
			if (!currentPosition || currentPosition === 'static') {
				this._mapContainer.style.position = 'relative';
			}
			this._mapContainer.appendChild(this._container);
		}

		/** Removes any active button highlight without firing the deselect callback. */
		public clearActiveButton(): void {
			this._clearActive();
		}

		/** Removes the toolbar from the DOM and resets state. */
		public dispose(): void {
			if (this._container?.parentNode) {
				this._container.remove();
			}
			this._container = undefined;
			this._activeButton = undefined;
			this._activeMode = undefined;
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
	}
}
