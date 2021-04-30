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
                markerOptions.position = this.config.location;
            } 
            markerOptions.map = this.map.provider;
            // If location's type is not coordinates
            // else {
            //     markerOptions.position = coordinates;
            // }
            this._provider = new google.maps.Marker(markerOptions);

            // this.buildFeatures();

            this.finishBuild();
        }

        // public buildFeatures(): void {
        //     this._fBuilder = new GoogleProvider.Feature.FeatureBuilder(this);

        //     this._features = this._fBuilder.features;

        //     this._fBuilder.build();
        // }

        // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
        public changeProperty(propertyName: string, value: any): void {
            const propValue = OSFramework.Enum.OS_Config_Map[propertyName];

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
    }
}
