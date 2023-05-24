// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace OSFramework.Maps.Configuration {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    export abstract class AbstractConfiguration implements IConfiguration {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
        constructor(config: any) {
            let key;
            for (key in config) {
                if (config[key] !== undefined) {
                    this[key] = config[key];
                }
            }
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        public abstract getProviderConfig(): any;
    }
}
