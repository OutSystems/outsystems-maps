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

        // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
        constructor(map: OSFramework.OSMap.IMap, markerId: string, configs: any) {
            super(
                map,
                markerId,
                new OSFramework.Configuration.Marker.GoogleMarkerConfig(configs)
            );
        }

        public build(): void {
            super.build();
            
            const markerOptions: google.maps.MarkerOptions = {};
            if (typeof this.config.iconUrl !== 'undefined' && this.config.iconUrl !== '') {
                markerOptions.icon = this.config.iconUrl;
            }
            if (typeof this.config.advancedFormat !== 'undefined' && this.config.advancedFormat !== '') {
                // Change advancedFormat
            }
            if (typeof this.config.location !== 'undefined' && this.config.location !== '') {
                GoogleProvider.Helper.Conversions.ConvertToCoordinates(this.config.location, this.map.config.apiKey)
                    .then((response) => {
                        markerOptions.position = { lat: response.lat, lng: response.lng };
                        markerOptions.map = this.map.provider;
                        this._provider = new google.maps.Marker(markerOptions);
                    });
            } else {
                throw new Error("Invalid location");
            }

        }

        // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
        public changeProperty(propertyName: string, value: any): void {
            const propValue = OSFramework.Enum.OS_Config_Marker[propertyName];

            switch (propValue) {
                case OSFramework.Enum.OS_Config_Marker.location:
                    GoogleProvider.Helper.Conversions.ConvertToCoordinates(value, this.map.config.apiKey)
                        .then(response => {
                            const coordinates = new google.maps.LatLng(
                                response.lat,
                                response.lng
                            );
                            this._provider.setPosition(coordinates);
                        });
                    return;
                case OSFramework.Enum.OS_Config_Map.advancedFormat:
                    const parsedAdvFormat = value !== '' ? JSON.parse(value) : '';
                    return this._provider.setOptions(parsedAdvFormat);
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

            this._provider = undefined;
        }

        /** Checks if the column has associated events */
        public get hasEvents(): boolean {
            return this.markerEvents !== undefined;
        }
    }
}
