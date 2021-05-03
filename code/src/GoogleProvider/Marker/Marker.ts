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

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        private _getProviderConfig(): any {
            return this.config.getProviderConfig();
        }

        private _convertAddressToCoordinates(
            address: string,
            apiKey: string
        ): any {    
            let jsondata;  
            return fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=${apiKey}`)
                .then(response => {
                    if(response.ok) {
                        return response.json();
                    } else {
                        throw new Error('Server response wasn\'t OK');
                    }
                })
                .then(json => {
                    jsondata = json.results[0].geometry.location;
                    console.log(jsondata);
                    return jsondata;
                })
        }

        public build(): void {
            super.build();
            
            const markerOptions: google.maps.MarkerOptions = {};
            if (
                typeof this.config.iconURL !== 'undefined' &&
                this.config.iconURL !== ''
            ) {
                markerOptions.icon = this.config.iconURL;
            }
            if (typeof this.config.location !== 'undefined') {
                var letters = /[a-zA-Z]/g;
                var setLatitude;
                var setLongitude;
                if (this.config.location.search(letters) == -1) {
                    if (this.config.location.indexOf(',') > -1) {
                        setLatitude = this.config.location.split(',')[0].replace(' ', '');
                        setLongitude = this.config.location.split(',')[1].replace(' ', '');
                        markerOptions.position.lat = setLatitude;
                        markerOptions.position.lng = setLongitude;
                    }
                }
                else {
                    this.config.location = this.config.location.replace(/[^a-zA-Z0-9 ]/g, "");
                    var coordinates = this._convertAddressToCoordinates(this.config.location, this.map.config.apiKey);
                    coordinates.then(function (response) {
                        console.log(response.lat);
                        markerOptions.position = {lat: response.lat, lng: response.lng};
                    });
                }
            } 
            markerOptions.map = this.map.provider;
            // If location's type is not coordinates
            // else {
            //     markerOptions.position = coordinates;
            // }
            this._provider = new google.maps.Marker(markerOptions);

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
                    const coordinates = new google.maps.LatLng(
                        value.lat,
                        value.lng
                    );
                    return this._provider.setPosition(coordinates);
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
