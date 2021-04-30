/// <reference path="../AbstractConfiguration.ts" />

// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace OSFramework.Configuration.Marker {
    export class GoogleMarkerConfig
        extends AbstractConfiguration
        implements IConfigurationMarker {

        public advancedFormat: string;
        public iconURL: string;
        public location: OSStructures.OSMap.Coordinates;
        public uniqueId: string;

        // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
        constructor(config: any) {
            super(config);
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        public getProviderConfig(): any {
            // eslint-disable-next-line prefer-const
            let provider = {
                advancedFormat: this.advancedFormat,
                iconURL: this.iconURL,
                location: this.location,
                uniqueId: this.uniqueId
            };

            //Cleanning undefined properties
            Object.keys(provider).forEach(
                (key) => provider[key] === undefined && delete provider[key]
            );

            return provider;
        }
    }
}
