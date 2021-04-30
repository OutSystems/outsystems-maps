// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace GoogleProvider.Feature {
    export interface IFeatures {
        features: OSFramework.Feature.ExposedFeatures;
        dispose(): void;
    }

    export abstract class AbstractFactoryBuilder
        implements IFeatures, OSFramework.Interface.IBuilder {
        protected _features: OSFramework.Feature.ExposedFeatures;
        protected _map: OSFramework.OSMap.IMap;
        public _featureList: OSFramework.Interface.IBuilder[];

        constructor(map: OSFramework.OSMap.IMap) {
            this._map = map;
            this._featureList = [];
            this._features = new OSFramework.Feature.ExposedFeatures();
        }

        // eslint-disable-next-line @typescript-eslint/naming-convention, @typescript-eslint/no-explicit-any
        private _instanceOfIDisposable(
            object: any
        ): object is OSFramework.Interface.IDisposable {
            return 'dispose' in object;
        }

        protected _makeItem<T extends OSFramework.Interface.IBuilder>(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            c: new (...args: any) => T,
            // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
            ...args
        ): T {
            const o = new c(this._map, ...args);
            this._featureList.push(o);
            return o;
        }

        public get features(): OSFramework.Feature.ExposedFeatures {
            return this._features;
        }

        public build(): void {
            this._featureList.forEach((p) => p.build());
        }

        public dispose(): void {
            this._featureList.forEach((p) => {
                this._instanceOfIDisposable(p) &&
                    (p as OSFramework.Interface.IDisposable).dispose();
                p = undefined;
            });
        }
    }

    export class FeatureBuilder extends AbstractFactoryBuilder {
        private _makeTrafficLayer(enable: boolean): FeatureBuilder {
            this._features.trafficLayer = this._makeItem(TrafficLayer, enable);
            return this;
        }

        private _makeStaticMap(enable: boolean): FeatureBuilder {
            this._features.staticMap = this._makeItem(StaticMap, enable);
            return this;
        }
        
        public build(): void {
            const config = this._map
                .config as OSFramework.Configuration.OSMap.GoogleMapConfig;

            this._makeTrafficLayer(config.showTraffic)
                ._makeStaticMap(config.staticMap);

            super.build();
        }
    }
}
