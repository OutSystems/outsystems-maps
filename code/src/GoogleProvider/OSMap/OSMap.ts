/// <reference path="../../OSFramework/OSMap/AbstractMap.ts" />

// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace GoogleProvider.OSMap {
    export class Map
        extends OSFramework.OSMap.AbstractMap<
            google.maps.Map,
            Configuration.OSMap.GoogleMapConfig
        >
        implements IMapGoogle
    {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        private _advancedFormatObj: any;
        private _fBuilder: Feature.FeatureBuilder;
        private _listeners: Array<string>;
        private _scriptCallback: () => void;

        // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
        constructor(mapId: string, configs: any) {
            super(
                mapId,
                new Configuration.OSMap.GoogleMapConfig(configs),
                OSFramework.Enum.MapType.Map
            );
        }

        private _buildDrawingTools(): void {
            // There is only one drawingTools per map
            this.drawingTools && this.drawingTools.build();
        }

        private _buildFileLayers(): void {
            this.fileLayers.forEach((fileLayer) => fileLayer.build());
        }

        private _buildHeatmapLayers(): void {
            this.heatmapLayers.forEach((heatmapLayer) => heatmapLayer.build());
        }

        private _buildMarkers(): void {
            this.markers.forEach((marker) => marker.build());
        }

        private _buildShapes(): void {
            this.shapes.forEach((shape) => shape.build());
        }

        /**
         * Creates the Map via GoogleMap API
         */
        private _createGoogleMap(): void {
            if (this._scriptCallback !== undefined) {
                document
                    .getElementById('google-maps-script')
                    .removeEventListener('load', this._scriptCallback);
            }
            if (typeof google === 'object' && typeof google.maps === 'object') {
                // Make sure the center is saved before setting a default value which is going to be used
                // before the conversion of the location to coordinates gets resolved
                const currentCenter = this.config.center;

                this._provider = new google.maps.Map(
                    OSFramework.Helper.GetElementByUniqueId(
                        this.uniqueId
                    ).querySelector(
                        OSFramework.Helper.Constants.runtimeMapUniqueIdCss
                    ),
                    // The provider config will retrieve the default center position
                    // (this.config.center = OSFramework.Helper.Constants.defaultMapCenter)
                    // Which will get updated after the Map is rendered
                    this._getProviderConfig()
                );
                // Check if the provider has been created with a valid APIKey
                window['gm_authFailure'] = () =>
                    this.mapEvents.trigger(
                        OSFramework.Event.OSMap.MapEventType.OnError,
                        this,
                        OSFramework.Enum.ErrorCodes.LIB_InvalidApiKeyMap
                    );

                this.buildFeatures();
                this._buildMarkers();
                this._buildShapes();
                this._buildDrawingTools();
                this._buildFileLayers();
                this._buildHeatmapLayers();
                this.finishBuild();

                // Make sure to change the center after the conversion of the location to coordinates
                this.features.center.updateCenter(currentCenter);

                // Make sure the style is converted from an id to the correspondent JSON
                this._provider.setOptions({
                    styles: GetStyleByStyleId(this.config.style),
                    ...this._advancedFormatObj
                });

                // We can only set the events on the provider after its creation
                this._setMapEvents(this._advancedFormatObj.mapEvents);
            } else {
                throw Error(`The google.maps lib has not been loaded.`);
            }
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        private _getProviderConfig(): google.maps.MapOptions {
            // Make sure the center has a default value before the conversion of the location to coordinates
            this.config.center = OSFramework.Helper.Constants.defaultMapCenter;
            // Take care of the advancedFormat options which can override the previous configuration
            this._advancedFormatObj = OSFramework.Helper.JsonFormatter(
                this.config.advancedFormat
            );

            return this.config.getProviderConfig();
        }

        /**
         * Initializes the Google Map.
         * 1) Add the script from GoogleAPIS to the header of the page
         * 2) Creates the Map via GoogleMap API
         */
        private _initializeGoogleMap(): void {
            if (typeof google === 'object' && typeof google.maps === 'object') {
                this._createGoogleMap();
            } else {
                let script = document.getElementById(
                    'google-maps-script'
                ) as HTMLScriptElement;
                if (script === null) {
                    script = document.createElement('script');
                    /* eslint-disable-next-line prettier/prettier */
                    script.src =
                        OSFramework.Helper.Constants.googleMapsApiMap +
                        '?key=' +
                        this.config.apiKey +
                        // In order to use the drawingTools we need to add it into the libraries via the URL = drawing
                        // In order to use the heatmap we need to add it into the libraries via the URL = visualization
                        // In order to use the searchplaces we need to add it into the libraries via the URL = places (in case the Map is the first to import the scripts)
                        '&libraries=drawing,visualization,places';
                    script.async = true;
                    script.defer = true;
                    script.id = 'google-maps-script';
                    document.head.appendChild(script);
                }
                this._scriptCallback = this._createGoogleMap.bind(this);
                script.addEventListener('load', this._scriptCallback);
            }
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        private _setMapEvents(events?: Array<string>): void {
            if (this._listeners === undefined) this._listeners = [];
            // Make sure all the listeners get removed before adding the new ones
            this._listeners.forEach((eventListener, index) => {
                // Google maps api way of clearing listeners from the map provider
                google.maps.event.clearListeners(this.provider, eventListener);
                this._listeners.splice(index, 1);
            });

            // OnEventTriggered Event (other events that can be set on the advancedFormat of the Map)
            // We are deprecating the advancedFormat and the OnEventTriggered as well
            // We might need to remove the following lines inside the If Statement
            if (
                this.mapEvents.hasHandlers(
                    OSFramework.Event.OSMap.MapEventType.OnEventTriggered
                ) &&
                events !== undefined
            ) {
                events.forEach((eventName: string) => {
                    this._listeners.push(eventName);
                    this._provider.addListener(eventName, () => {
                        this.mapEvents.trigger(
                            OSFramework.Event.OSMap.MapEventType
                                .OnEventTriggered,
                            this,
                            eventName
                        );
                    });
                });
            }

            // Any events that got added to the mapEvents via the API Subscribe method will have to be taken care here
            // If the Event type of each handler is MapProviderEvent, we want to make sure to add that event to the listeners of the google maps provider (e.g. click, dblclick, contextmenu, etc)
            // Otherwise, we don't want to add them to the google provider listeners (e.g. OnInitialize, OnError, OnTriggeredEvent)
            this.mapEvents.handlers.forEach(
                (
                    handler: OSFramework.Event.IEvent<OSFramework.OSMap.IMap>,
                    eventName
                ) => {
                    if (
                        handler instanceof
                        OSFramework.Event.OSMap.MapProviderEvent
                    ) {
                        this._listeners.push(eventName);
                        this._provider.addListener(
                            // Name of the event (e.g. click, dblclick, contextmenu, etc)
                            eventName,
                            // Callback CAN have an attribute (e) which is of the type MapMouseEvent
                            // Trigger the event by specifying the ProviderEvent MapType and the coords (lat, lng) if the callback has the attribute MapMouseEvent
                            (e?: google.maps.MapMouseEvent) => {
                                this.mapEvents.trigger(
                                    OSFramework.Event.OSMap.MapEventType
                                        .ProviderEvent,
                                    this,
                                    eventName,
                                    e !== undefined
                                        ? JSON.stringify({
                                              Lat: e.latLng.lat(),
                                              Lng: e.latLng.lng()
                                          })
                                        : undefined
                                );
                            }
                        );
                    }
                }
            );
        }

        public get mapTag(): string {
            return OSFramework.Helper.Constants.mapTag;
        }

        public get providerEvents(): Array<string> {
            return Constants.OSMap.Events;
        }

        public addDrawingTools(
            drawingTools: OSFramework.DrawingTools.IDrawingTools
        ): OSFramework.DrawingTools.IDrawingTools {
            super.addDrawingTools(drawingTools);

            if (this.isReady) {
                drawingTools.build();
            }

            return drawingTools;
        }

        public addFileLayer(
            fileLayer: OSFramework.FileLayer.IFileLayer
        ): OSFramework.FileLayer.IFileLayer {
            super.addFileLayer(fileLayer);

            if (this.isReady) {
                fileLayer.build();
            }

            return fileLayer;
        }

        public addHeatmapLayer(
            fileLayer: OSFramework.HeatmapLayer.IHeatmapLayer
        ): OSFramework.HeatmapLayer.IHeatmapLayer {
            super.addHeatmapLayer(fileLayer);

            if (this.isReady) {
                fileLayer.build();
            }

            return fileLayer;
        }

        public addMarker(
            marker: OSFramework.Marker.IMarker
        ): OSFramework.Marker.IMarker {
            super.addMarker(marker);

            if (this.isReady) {
                marker.build();
            }

            return marker;
        }

        public addShape(
            shape: OSFramework.Shape.IShape
        ): OSFramework.Shape.IShape {
            super.addShape(shape);

            if (this.isReady) {
                shape.build();
            }

            return shape;
        }

        public build(): void {
            super.build();

            this._initializeGoogleMap();
        }

        public buildFeatures(): void {
            this._fBuilder = new Feature.FeatureBuilder(this);
            this._features = this._fBuilder.features;
            this._fBuilder.build();
        }

        public changeDrawingToolsProperty(
            drawingToolsId: string,
            propertyName: string,
            // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
            propertyValue: any
        ): void {
            // There is only one (max) drawingTools element per map
            const drawingTools = this.drawingTools;

            if (
                drawingTools === undefined ||
                drawingTools.uniqueId !== drawingToolsId
            ) {
                console.error(
                    `changeDrawingToolsProperty - drawingToold id:${drawingToolsId} not found.`
                );
            } else {
                drawingTools.changeProperty(propertyName, propertyValue);
            }
        }

        public changeFileLayerProperty(
            fileLayerId: string,
            propertyName: string,
            // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
            propertyValue: any
        ): void {
            // There is only one (max) drawingTools element per map
            const fileLayer = this.getFileLayer(fileLayerId);

            if (!fileLayer) {
                console.error(
                    `changeFileLayerProperty - fileLayer id:${fileLayerId} not found.`
                );
            } else {
                fileLayer.changeProperty(propertyName, propertyValue);
            }
        }

        public changeHeatmapLayerProperty(
            heatmapLayerId: string,
            propertyName: string,
            // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
            propertyValue: any
        ): void {
            const heatmapLayer = this.getHeatmapLayer(heatmapLayerId);

            if (!heatmapLayer) {
                console.error(
                    `changeHeatmapLayerProperty - heatmapLayer id:${heatmapLayerId} not found.`
                );
            } else {
                heatmapLayer.changeProperty(propertyName, propertyValue);
            }
        }

        public changeMarkerProperty(
            markerId: string,
            propertyName: string,
            // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
            propertyValue: any
        ): void {
            const marker = this.getMarker(markerId);

            if (!marker) {
                console.error(
                    `changeMarkerProperty - marker id:${markerId} not found.`
                );
            } else {
                marker.changeProperty(propertyName, propertyValue);
            }
        }

        // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
        public changeProperty(propertyName: string, value: any): void {
            const propValue = OSFramework.Enum.OS_Config_Map[propertyName];
            super.changeProperty(propertyName, value);
            if (this.isReady) {
                switch (propValue) {
                    case OSFramework.Enum.OS_Config_Map.apiKey:
                        if (this.config.apiKey !== '') {
                            this.mapEvents.trigger(
                                OSFramework.Event.OSMap.MapEventType.OnError,
                                this,
                                OSFramework.Enum.ErrorCodes
                                    .CFG_APIKeyAlreadySetMap
                            );
                        }
                        return;
                    case OSFramework.Enum.OS_Config_Map.center:
                        return this.features.center.updateCenter(value);
                    case OSFramework.Enum.OS_Config_Map.offset:
                        return this.features.offset.setOffset(
                            JSON.parse(value)
                        );
                    case OSFramework.Enum.OS_Config_Map.zoom:
                        return this.features.zoom.setLevel(value);
                    case OSFramework.Enum.OS_Config_Map.type:
                        return this._provider.setMapTypeId(value);
                    case OSFramework.Enum.OS_Config_Map.style:
                        return this._provider.setOptions({
                            styles: GetStyleByStyleId(value)
                        });
                    case OSFramework.Enum.OS_Config_Map.advancedFormat:
                        value = OSFramework.Helper.JsonFormatter(value);
                        // Make sure the MapEvents that are associated in the advancedFormat get updated
                        this._setMapEvents(value.mapEvents);
                        return this._provider.setOptions(value);
                    case OSFramework.Enum.OS_Config_Map.showTraffic:
                        return this.features.trafficLayer.setState(value);
                    case OSFramework.Enum.OS_Config_Map.markerClustererActive:
                    case OSFramework.Enum.OS_Config_Map.markerClustererMaxZoom:
                    case OSFramework.Enum.OS_Config_Map
                        .markerClustererMinClusterSize:
                    case OSFramework.Enum.OS_Config_Map
                        .markerClustererZoomOnClick:
                        return this.features.markerClusterer.changeProperty(
                            propertyName,
                            value
                        );
                }
            }
        }

        public changeShapeProperty(
            shapeId: string,
            propertyName: string,
            // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
            propertyValue: any
        ): void {
            const shape = this.getShape(shapeId);

            if (!shape) {
                console.error(
                    `changeShapeProperty - shape id:${shapeId} not found.`
                );
            } else {
                shape.changeProperty(propertyName, propertyValue);
            }
        }

        public dispose(): void {
            super.dispose();

            this._fBuilder.dispose();

            this._provider = undefined;
        }

        public refresh(): void {
            let position = this.features.center.getCenter();
            // When the position is empty, we use the default position
            // If the configured center position of the map is equal to the default
            const isDefault =
                position.lat ===
                    OSFramework.Helper.Constants.defaultMapCenter.lat &&
                position.lng ===
                    OSFramework.Helper.Constants.defaultMapCenter.lng;
            // If the Map has the default center position and at least 1 Marker, we want to use the first Marker position as the new center of the Map
            if (
                isDefault === true &&
                this.markers.length >= 1 &&
                this.markers[0].provider !== undefined
            ) {
                position = this.markers[0].provider.position.toJSON();
            }
            // If the Map has NOT the default center position and EXACTLY 1 Marker, we want to use the first Marker position as the new center of the Map
            else if (
                isDefault === false &&
                this.markers.length === 1 &&
                this.markers[0].provider !== undefined
            ) {
                position = this.markers[0].provider.position.toJSON();
            }
            // If the Map has NOT the default center position, 2 or more Markers and the zoom is set to be AutoFit
            // we want to use the first Marker position as the new center of the Map
            else if (
                isDefault === false &&
                this.markers.length >= 2 &&
                this.markers[0].provider !== undefined &&
                this.features.zoom.isAutofit
            ) {
                position = this.markers[0].provider.position.toJSON();
            }

            // Refresh the center position
            this.features.center.refreshCenter(position);

            // Refresh the zoom
            this.features.zoom.refreshZoom();

            // Refresh the offset
            this.features.offset.setOffset(this.features.offset.getOffset);

            // Repaint the marker Clusterers
            this.features.markerClusterer.repaint();
        }

        public refreshProviderEvents(): void {
            if (this.isReady) this._setMapEvents();
        }
    }
}
