/// <reference path="../../OSFramework/Marker/AbstractMarker.ts" />

// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace GoogleProvider.Marker {
    export class Marker
        extends OSFramework.Marker.AbstractMarker<
            google.maps.Marker,
            OSFramework.Configuration.Marker.GoogleMarkerConfig
        >
        implements IMarkerGoogle {
        private _fBuilder: GoogleProvider.Feature.FeatureBuilder;
        private _markerOptions: google.maps.MarkerOptions;

        // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
        constructor(map:OSFramework.OSMap.IMap, markerId: string, configs: any) {
            super(
                map,
                markerId,
                new OSFramework.Configuration.Marker.GoogleMarkerConfig(configs)
            );
        }

        private _convertCoordinates(location: string | OSFramework.OSStructures.OSMap.Coordinates): Promise<OSFramework.OSStructures.OSMap.Coordinates> {
            if (typeof location !== 'undefined' && typeof location === 'string') {
                return GoogleProvider.Helper.Conversions.ConvertAddressToCoordinates(location, this.map.config.apiKey).then((response) => {
                    return response;
                });
            }
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        private _getProviderConfig(): any {
            return this.config.getProviderConfig();
        }

        public build(): void {
            super.build();
            
            const markerOptions: google.maps.MarkerOptions = {};
            if (typeof this.config.iconURL !== 'undefined' && this.config.iconURL !== '') {
                markerOptions.icon = this.config.iconURL;
            }
            if (typeof this.config.location !== 'undefined') {
                this._convertCoordinates(this.config.location)
                    .then((response) => {
                        markerOptions.position = { lat: response.lat, lng: response.lng };
                        markerOptions.map = this.map.provider;
                        this._provider = new google.maps.Marker(markerOptions);
                    });
            } 
            // this.buildFeatures();
        }

        // public buildFeatures(): void {
        //     this._fBuilder = new GoogleProvider.Feature.FeatureBuilder(this);

        //     this._features = this._fBuilder.features;

        //     this._fBuilder.build();
        // }

        // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
        public changeProperty(propertyName: string, value: any): void {
            const propValue = OSFramework.Enum.OS_Config_Marker[propertyName];

            switch (propValue) {
                case OSFramework.Enum.OS_Config_Marker.location:
                    this._convertCoordinates(value).then(response => {
                        const coordinates = new google.maps.LatLng(
                            response.lat,
                            response.lng
                        );
                        this._provider.setPosition(coordinates);
                    });
                    return;
                case OSFramework.Enum.OS_Config_Marker.advancedFormat:
                    return this._provider.setOptions(value);
                case OSFramework.Enum.OS_Config_Marker.iconURL:
                    return this._provider.setIcon(value);

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

        /** Checks if the column has associated events */
        public get hasEvents(): boolean {
            return this.markerEvents !== undefined;
        }
    }
}
