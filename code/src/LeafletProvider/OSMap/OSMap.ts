/// <reference path="../../OSFramework/OSMap/AbstractMap.ts" />

// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace LeafletProvider.OSMap {
    export class Map
        extends OSFramework.OSMap.AbstractMap<
            L.Map,
            Configuration.OSMap.LeafletMapConfig
        >
        implements IMapLeaflet
    {
        private _addedEvents: Array<string>;
        private _fBuilder: Feature.FeatureBuilder;
        private _openStreetMapLayer: L.TileLayer;

        // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
        constructor(mapId: string, configs: any) {
            super(
                mapId,
                OSFramework.Enum.ProviderType.Leaflet,
                new Configuration.OSMap.LeafletMapConfig(configs),
                OSFramework.Enum.MapType.Map
            );
            this._addedEvents = [];
            // Set the openStreetMapLayer with the URL and the attribution needed
            this._openStreetMapLayer = new L.TileLayer(
                OSFramework.Helper.Constants.openStreetMapTileLayer.url,
                {
                    attribution:
                        OSFramework.Helper.Constants.openStreetMapTileLayer
                            .attribution
                }
            );
        }

        private _buildMarkers(): void {
            this.markers.forEach((marker) => marker.build());
        }

        private _buildShapes(): void {
            this.shapes.forEach((shape) => shape.build());
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        private _getProviderConfig(): L.MapOptions {
            // Make sure the center has a default value before the conversion of the location to coordinates
            this.config.center = OSFramework.Helper.Constants.defaultMapCenter;

            return this.config.getProviderConfig();
        }

        private _setMapEvents(): void {
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
                        this._addedEvents.push(eventName);
                        this._provider.addEventListener(
                            // Get the correct eventName for leaflet provider
                            // Name of the event (e.g. click, dblclick, contextmenu, etc)
                            Constants.OSMap.ProviderEventNames[eventName],
                            // Callback CAN have an attribute (e) which is of the type MapMouseEvent
                            // Trigger the event by specifying the ProviderEvent MapType and the coords (lat, lng) if the callback has the attribute MapMouseEvent
                            (e?: L.LeafletMouseEvent) => {
                                this.mapEvents.trigger(
                                    OSFramework.Event.OSMap.MapEventType
                                        .ProviderEvent,
                                    this,
                                    eventName,
                                    e && e.latlng !== undefined
                                        ? JSON.stringify({
                                              Lat: e.latlng.lat,
                                              Lng: e.latlng.lng
                                          })
                                        : undefined
                                );
                            }
                        );
                    }
                }
            );
        }

        // Useful when using shared Component methods (Maps and SearchPlaces)
        public get addedEvents(): Array<string> {
            return this._addedEvents;
        }

        public get mapTag(): string {
            return OSFramework.Helper.Constants.mapTag;
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

            // Make sure the center is saved before setting a default value which is going to be used
            // before the conversion of the location to coordinates gets resolved
            const currentCenter = this.config.center;

            this._provider = new L.Map(
                OSFramework.Helper.GetElementByUniqueId(
                    this.uniqueId
                ).querySelector(
                    OSFramework.Helper.Constants.runtimeMapUniqueIdCss
                ) as HTMLElement,
                {
                    ...this._getProviderConfig(),
                    layers: [this._openStreetMapLayer]
                }
            );
            this.buildFeatures();
            // this._buildMarkers();
            // this._buildShapes();
            // this._buildDrawingTools();
            // this._buildFileLayers();
            // this._buildHeatmapLayers();
            this.finishBuild();

            // Make sure to change the center after the conversion of the location to coordinates
            this.features.center.updateCenter(currentCenter as string);
            this._setMapEvents();
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
                    case OSFramework.Enum.OS_Config_Map.center:
                        return this.features.center.updateCenter(value);
                    case OSFramework.Enum.OS_Config_Map.offset:
                        return this.features.offset.setOffset(
                            JSON.parse(value)
                        );
                    case OSFramework.Enum.OS_Config_Map.zoom:
                        return this.features.zoom.setLevel(value);
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
                position = this.markers[0].provider.getLatLng();
            }
            // If the Map has NOT the default center position and EXACTLY 1 Marker, we want to use the first Marker position as the new center of the Map
            else if (
                isDefault === false &&
                this.markers.length === 1 &&
                this.markers[0].provider !== undefined
            ) {
                position = this.markers[0].provider.getLatLng();
            }
            // If the Map has NOT the default center position, 2 or more Markers and the zoom is set to be AutoFit
            // we want to use the first Marker position as the new center of the Map
            else if (
                isDefault === false &&
                this.markers.length >= 2 &&
                this.markers[0].provider !== undefined &&
                this.features.zoom.isAutofit
            ) {
                position = this.markers[0].provider.getLatLng();
            }

            // Refresh the center position
            this.features.center.refreshCenter(position);

            // Refresh the zoom
            this.features.zoom.refreshZoom();

            // Refresh the offset
            this.features.offset.setOffset(this.features.offset.getOffset);

            // Repaint the marker Clusterers
            this.features.markerClusterer?.repaint();
        }

        public refreshProviderEvents(): void {
            if (this.isReady) this._setMapEvents();
        }

        public updateHeight(): void {
            if (this.isReady) this._provider.invalidateSize();
        }

        public validateProviderEvent(eventName: string): boolean {
            return Constants.OSMap.ProviderEventNames[eventName] !== undefined;
        }
    }
}
