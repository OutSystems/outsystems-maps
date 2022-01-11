/// <reference path="AbstractProviderTool.ts" />

// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace LeafletProvider.DrawingTools {
    export class DrawMarker extends AbstractProviderTool<Configuration.DrawingTools.DrawMarkerConfig> {
        private _defaultIcon: L.DivIcon;

        constructor(
            map: OSFramework.OSMap.IMap,
            drawingTools: OSFramework.DrawingTools.IDrawingTools,
            drawingToolsId: string,
            type: string,
            configs: Configuration.DrawingTools.DrawMarkerConfig
        ) {
            super(
                map,
                drawingTools,
                drawingToolsId,
                type,
                new Configuration.DrawingTools.DrawMarkerConfig(configs)
            );

            this._defaultIcon = new L.DivIcon({
                iconSize: [24, 40],
                className: 'marker-leaflet-icon',
                iconAnchor: [12, 40]
            });
        }

        /**
         * Sets the new icon on the Marker just by using the iconUrl
         * The width and the height of the icon will use the one in the configs (if set) or will use the default image size
         * The icon will be centered by x axis on the marker position but on the y axis it will appear right above it
         */
        private _createIcon(iconUrl: string): L.DivIcon {
            let icon: L.DivIcon;
            // If the iconUrl is not set or is empty, we should use the defaultIcon
            if (iconUrl === '') {
                // icon will have the following configurations:
                // iconSize: [24, 40],
                // className: 'marker-leaflet-icon',
                // iconAnchor: [12, 40]
                icon = this._defaultIcon;
            } else {
                let iconSize: L.PointExpression;
                let iconAnchor: L.PointExpression; /*
                TODO - 
                // If the size of the icon is defined by a valid width and height, use those values
                // Else If nothing is passed or the icon size has the width or the height equal to 0, use the full image size
                if (this.config.iconWidth > 0 && this.config.iconHeight > 0) {
                    iconSize = [this.config.iconWidth, this.config.iconHeight];
                    // The icon will be centered by x axis on the marker position but on the y axis it will appear right above it
                    iconAnchor = [
                        this.config.iconWidth / 2,
                        this.config.iconHeight
                    ];
                }*/
                // Update the icon using the previous configurations
                icon = new L.Icon({
                    iconUrl,
                    iconSize,
                    iconAnchor
                });
            }

            return icon;
        }

        private _setOnChangeEvent(_marker: OSFramework.Marker.IMarker): void {
            _marker.markerEvents.addHandler(
                // changing the marker location is only available via the drag-and-drop, so the solution passes by adding the dragend event listener as the marker's OnChanged event
                'dragend' as OSFramework.Event.Marker.MarkerEventType,
                // Trigger the onDrawingChangeEvent with the extra information (marker uniqueId and flag indicating that the element is not new)
                () => this.triggerOnDrawingChangeEvent(_marker.uniqueId, false)
            );
        }

        /** Get the constant for the event markercomplete */
        protected get completedToolEventName(): string {
            return OSFramework.Helper.Constants.drawingMarkerCompleted;
        }

        public get options(): L.MarkerOptions {
            return this.internalOptions;
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
        protected set options(options: any) {
            const allOptions = { ...this.options, ...options };
            this.drawingTools.provider.setDrawingOptions({
                marker: allOptions
            });
            this.internalOptions = allOptions;
        }

        protected createElement(
            uniqueId: string,
            marker: L.Marker,
            // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
            configs: any
        ): OSFramework.Marker.IMarker {
            const location = `${marker.getLatLng().lat},${
                marker.getLatLng().lng
            }`;

            // Join both the configs that were provided for the new marker element and the location that was provided by the DrawingTools markercomplete event
            const finalConfigs = { ...configs, location };

            const _marker = Marker.MarkerFactory.MakeMarker(
                this.map,
                uniqueId,
                OSFramework.Enum.MarkerType.Marker,
                finalConfigs
            );

            // Add the onChange event to the new element
            this._setOnChangeEvent(_marker);
            // Add the new element to the map
            this.map.addMarker(_marker);
            return _marker;
        }

        public build(): void {
            super.build();
            this.options = {
                ...this.getProviderConfig(),
                icon: this._createIcon(this.config.iconUrl)
            };
        }

        // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
        public changeProperty(propertyName: string, value: any): void {
            const propValue = OSFramework.Enum.OS_Config_Marker[propertyName];
            super.changeProperty(propertyName, value);
            if (this.drawingTools.isReady) {
                switch (propValue) {
                    case OSFramework.Enum.OS_Config_Marker.iconUrl:
                        this.options = { icon: this._createIcon(value) };
                        return;
                }
            }
        }
    }
}
