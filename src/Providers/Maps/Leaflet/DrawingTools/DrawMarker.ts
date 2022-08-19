/// <reference path="AbstractProviderTool.ts" />

// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace Provider.Leaflet.DrawingTools {
    export class DrawMarker extends AbstractProviderTool<Configuration.DrawingTools.DrawMarkerConfig> {
        private _defaultIcon: L.DivIcon;

        constructor(
            map: OSFramework.Maps.OSMap.IMap,
            drawingTools: OSFramework.Maps.DrawingTools.IDrawingTools,
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
                iconSize: Constants.Marker.defaultSize,
                className: 'marker-leaflet-icon',
                iconAnchor: Constants.Marker.defaultAnchor
            });
        }

        /**
         * Sets the new icon on the Marker just by using the iconUrl
         * The width and the height of the icon will use the one in the configs (if set) or will use the default image size
         * The icon will be centered by x axis on the marker position but on the y axis it will appear right above it
         */
        private _createIcon(iconUrl: string): L.DivIcon {
            // By default, we will use the defaultIcon
            // icon will have the following configurations:
            // iconSize: [24, 40],
            // className: 'marker-leaflet-icon',
            // iconAnchor: [12, 40]
            let icon: L.DivIcon = this._defaultIcon;

            //If iconUrl is defined, we should reset icon properties
            if (iconUrl !== '') {
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

        private _setOnChangeEvent(
            _marker: OSFramework.Maps.Marker.IMarker
        ): void {
            _marker.markerEvents.addHandler(
                // changing the marker location is only available via the drag-and-drop, so the solution passes by adding the dragend event listener as the marker's OnChanged event
                'dragend' as OSFramework.Maps.Event.Marker.MarkerEventType,
                // Trigger the onDrawingChangeEvent with the extra information (marker uniqueId and flag indicating that the element is not new)
                () =>
                    this.triggerOnDrawingChangeEvent(
                        _marker.uniqueId,
                        false,
                        JSON.stringify(this.config.iconUrl),
                        _marker.config.location
                    )
            );
        }

        /** Get the constant for the event markercomplete */
        protected get completedToolEventName(): string {
            return OSFramework.Maps.Helper.Constants.drawingMarkerCompleted;
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
        ): OSFramework.Maps.Marker.IMarker {
            const location = `${marker.getLatLng().lat},${
                marker.getLatLng().lng
            }`;

            // Join both the configs that were provided for the new marker element and the location that was provided by the DrawingTools markercomplete event
            const finalConfigs = { ...configs, location };

            const _marker = Marker.MarkerFactory.MakeMarker(
                this.map,
                uniqueId,
                OSFramework.Maps.Enum.MarkerType.Marker,
                finalConfigs
            );

            // Add the onChange event to the new element
            this._setOnChangeEvent(_marker);
            // Add the new element to the map
            this.map.addMarker(_marker);
            return _marker;
        }

        /** Gets the coordinates of the new marker, with the expected lat/lng structure */
        protected getCoordinates(): string {
            const locations = this.newElm.config.location;
            let coordinatesArray = [];

            coordinatesArray = locations.split(',');

            const coordinates = {
                Lat: coordinatesArray[0],
                Lng: coordinatesArray[1]
            };

            return JSON.stringify(coordinates);
        }

        /** Gets the location of the new shape (marker), as a string */
        protected getLocation(): string {
            return this.newElm.config.location;
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
            const propValue =
                OSFramework.Maps.Enum.OS_Config_Marker[propertyName];
            super.changeProperty(propertyName, value);
            if (this.drawingTools.isReady) {
                switch (propValue) {
                    case OSFramework.Maps.Enum.OS_Config_Marker.iconUrl:
                        this.options = { icon: this._createIcon(value) };
                        return;
                }
            }
        }
    }
}
