/// <reference path="../../OSFramework/OSMap/AbstractMap.ts" />

// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace GoogleProvider.Map {
    export class Map
        extends OSFramework.OSMap.AbstractMap<
            google.maps.Map,
            OSFramework.Configuration.OSMap.GoogleMapConfig
        >
        implements IMapGoogle {
        private _fBuilder: GoogleProvider.Feature.FeatureBuilder;

        // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
        constructor(mapId: string, configs: any) {
            super(
                mapId,
                new OSFramework.Configuration.OSMap.GoogleMapConfig(configs)
            );
        }

        // eslint-disable-next-line @typescript-eslint/member-ordering
        private _buildMarkers(): void {
            // this.getMarkers().forEach((marker) => marker.build());
        }

        private _convertCoordinates(location: string | OSFramework.OSStructures.OSMap.Coordinates): Promise<OSFramework.OSStructures.OSMap.Coordinates> {
            if (typeof location !== 'undefined' && typeof location === 'string') {
                return GoogleProvider.Helper.Conversions.ConvertAddressToCoordinates(location, this.config.apiKey).then((response) => {
                    return response;
                });
            }
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        private _getProviderConfig(): google.maps.MapOptions {
            this._convertCoordinates(this.config.center).then(response => {
                this.config.center = response;
                this._provider.setCenter(this.config.center);
            });
            this.config.center = OSFramework.Helper.Constants.defaultMapCenter;
            return this.config.getProviderConfig();
        }

        private _initializeGoogleMap(): void {
            if (!document.getElementById('google-maps-script')) {
                // Create the script tag, set the appropriate attributes
                const script = document.createElement('script');
    
                script.src =
                    'https://maps.googleapis.com/maps/api/js?key=' + this.config.apiKey;
                script.async = true;
                script.defer = true;
                script.id = 'google-maps-script';
                document.head.appendChild(script);
                script.onload = this._createGoogleMap.bind(this);
            }
        }

        private _createGoogleMap(): void {
            if (typeof google === 'object' && typeof google.maps === 'object') {
                this._provider = new google.maps.Map(
                    OSFramework.Helper.GetElementByUniqueId(this.uniqueId),
                    this._getProviderConfig()
                );
                this.buildFeatures();
                this._buildMarkers();
                this.finishBuild();
            }else{
                throw Error(`The google.maps lib has not been loaded.`);
            }
        }

        public addMarker(marker: OSFramework.Marker.IMarker): OSFramework.Marker.IMarker {
            super.addMarker(marker);

            if (this.isReady) {
                marker.build();
            }

            return marker;
        }

        public build(): void {
            super.build();
            this._initializeGoogleMap();
        }

        public buildFeatures(): void {
            this._fBuilder = new GoogleProvider.Feature.FeatureBuilder(this);
            this._features = this._fBuilder.features;
            this._fBuilder.build();
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

            switch (propValue) {
                case OSFramework.Enum.OS_Config_Map.center:
                    this._convertCoordinates(value).then(response => {
                        const coordinates = new google.maps.LatLng(
                            response.lat,
                            response.lng
                        );
                        this._provider.setCenter(coordinates);
                    });
                    return;
                case OSFramework.Enum.OS_Config_Map.zoom:
                    return this._provider.setZoom(value);
                case OSFramework.Enum.OS_Config_Map.mapTypeId:
                    return this._provider.setMapTypeId(value);
                case OSFramework.Enum.OS_Config_Map.styles:
                    const style = GoogleProvider.GetStyleByStyleId(value);
                    return this._provider.setOptions({styles: style});
                case OSFramework.Enum.OS_Config_Map.advancedFormat:
                    return this._provider.setOptions(value);
                case OSFramework.Enum.OS_Config_Map.showTraffic:
                    return this.features.trafficLayer.setState(value);
                case OSFramework.Enum.OS_Config_Map.staticMap:
                    return this.features.staticMap.setState(value);
                case OSFramework.Enum.OS_Config_Map.offset:
                    return this.features.offset.setOffset(value);
                default:
                    throw Error(
                        `changeProperty - Property '${propertyName}' can't be changed.`
                    );
            }
        }

        public dispose(): void {
            super.dispose();

            this._fBuilder.dispose();

            this._provider = undefined;
        }
    }
}
