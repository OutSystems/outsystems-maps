// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace Provider.DrawingTools.TerraDraw {
	/**
	 * Builds and manages the Drawing Tools floating toolbar DOM element.
	 * Owned and lifecycle-managed by DrawingTools.
	 * Communicates back via injected callbacks — never holding a reference to the TerraDraw instance directly.
	 */
	export class DrawingToolsUi {
		private _activeButton: HTMLButtonElement | null;
		private _activeMode: string | null;
		private _container: HTMLElement;
		private _mapContainer: HTMLElement;
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
			const cls = Constants.positionClasses[position] ?? Constants.positionClasses[Constants.defaultPosition];
			this._container.classList.add(cls);
		}

		private _clearActive(): void {
			if (this._activeButton) {
				this._activeButton.classList.remove(Constants.cssButtonActive);
				this._activeButton.setAttribute('aria-checked', 'false');
				this._activeButton = null;
			}
			this._activeMode = null;
		}

		private _createButton(modeName: string, ariaLabel: string): HTMLButtonElement {
			const btn = document.createElement('button');
			btn.type = 'button';
			btn.className = Constants.cssButton;
			btn.dataset.mode = modeName;
			btn.title = ariaLabel;
			btn.setAttribute('role', 'menuitemradio');
			btn.setAttribute('aria-label', ariaLabel);
			btn.setAttribute('aria-checked', 'false');

			const icon = document.createElement('span');
			icon.className = Constants.cssButtonIcon;
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
			btn.classList.add(Constants.cssButtonActive);
			btn.setAttribute('aria-checked', 'true');
			this._activeButton = btn;
			this._activeMode = modeName;
		}

		public build(toolModeNames: string[], position: string): void {
			this._container = document.createElement('div');
			this._container.className = Constants.cssToolbar;
			this._container.setAttribute('role', 'menubar');
			this._applyPosition(position);

			// Adding the select button to the toolbar
			this._selectButton = this._createButton(Constants.ModeName.Select, 'Stop drawing');
			this._container.appendChild(this._selectButton);

			toolModeNames.forEach((mode) => {
				const ariaLabel =
					mode === Constants.ModeName.Marker
						? 'Add a marker'
						: `Draw a ${Constants.modeLabels[mode] ?? mode}`;
				this._container.appendChild(this._createButton(mode, ariaLabel));
			});

			// Ensure the map container is a positioning context via class (avoids inline style / CSP issues)
			if (!this._mapContainer.classList.contains(Constants.cssMapPositioned)) {
				this._mapContainer.classList.add(Constants.cssMapPositioned);
			}
			this._mapContainer.appendChild(this._container);
			this.setDefaultMode();
		}

		/** Removes the toolbar from the DOM and resets state. */
		public dispose(isFinalDispose: boolean = true): void {
			if (this._container?.parentNode) {
				this._container.remove();
				isFinalDispose && this._mapContainer.classList.remove(Constants.cssMapPositioned);
			}
			this._container = undefined;
			this._activeButton = undefined;
			this._activeMode = undefined;
			this._selectButton = undefined;

			isFinalDispose && (this._mapContainer = undefined);
		}

		/**
		 * Destroys and rebuilds the toolbar with an updated tool list.
		 * @param toolModeNames Updated list of TerraDraw mode names.
		 * @param position OS position string.
		 */
		public refresh(toolModeNames: string[], position: string): void {
			this.dispose(false);
			this.build(toolModeNames, position);
		}

		public setDefaultMode(): void {
			if (this._selectButton) {
				this._setActive(this._selectButton, Constants.ModeName.Select);
			}
		}
	}
}
