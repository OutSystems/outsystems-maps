/// <reference path="../../../OSFramework/Configuration/AbstractConfiguration.ts" />

// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace GoogleProvider.Configuration.SearchPlaces {
    export class SearchPlacesConfig
        extends OSFramework.Configuration.AbstractConfiguration
        implements OSFramework.Configuration.IConfigurationSearchPlaces
    {
        public apiKey: string;
        public countries: Array<string>;
        public searchArea: OSFramework.OSStructures.OSMap.BoundsString;
        public searchType: OSFramework.Enum.SearchTypes;

        // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
        constructor(config: any) {
            super(config);
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        public getProviderConfig(): any {
            // eslint-disable-next-line prefer-const
            let provider = {
                bounds: this.searchArea,
                strictBounds: !!this.searchArea,
                componentRestrictions: this.countries
                    ? { country: this.countries }
                    : undefined,
                types: this.searchType
                    ? // eslint-disable-next-line @typescript-eslint/no-unused-vars
                      [GoogleProvider.SearchPlaces.SearchTypes[this.searchType]]
                    : undefined
            };

            //Cleanning undefined properties
            Object.keys(provider).forEach((key) => {
                if (provider[key] === undefined) {
                    delete provider[key];
                }
            });

            return provider;
        }
    }
}
