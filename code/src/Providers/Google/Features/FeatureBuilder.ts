// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace Provider.Google.Feature {
    export interface IFeatures {
        features: OSFramework.Feature.ExposedFeatures;
        dispose(): void;
    }

    export abstract class AbstractFactoryBuilder
        implements IFeatures, OSFramework.Interface.IBuilder
    {
        protected _featureList: OSFramework.Interface.IBuilder[];
        protected _features: OSFramework.Feature.ExposedFeatures;
        protected _map: OSFramework.OSMap.IMap;

        constructor(map: OSFramework.OSMap.IMap) {
            this._map = map;
            this._featureList = [];
            this._features = new OSFramework.Feature.ExposedFeatures();
        }

        // eslint-disable-next-line @typescript-eslint/naming-convention, @typescript-eslint/no-explicit-any
        private _instanceOfIDisposable(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
        private _makeCenter(
            center: OSFramework.OSStructures.OSMap.Coordinates
        ): FeatureBuilder {
            this._features.center = this._makeItem(Center, center);
            return this;
        }
        private _makeDirections(): FeatureBuilder {
            this._features.directions = this._makeItem(Directions);
            return this;
        }
        private _makeInfoWindow(): FeatureBuilder {
            this._features.infoWindow = this._makeItem(InfoWindow);
            return this;
        }
        private _makeMarkerClusterer(
            markerClusterer: OSFramework.Configuration.IConfigurationMarkerClusterer
        ): FeatureBuilder {
            this._features.markerClusterer = this._makeItem(
                GoogleMarkerClusterer,
                markerClusterer
            );
            return this;
        }
        private _makeOffset(
            offset: OSFramework.OSStructures.OSMap.Offset
        ): FeatureBuilder {
            this._features.offset = this._makeItem(Offset, offset);
            return this;
        }
        private _makeTrafficLayer(enable: boolean): FeatureBuilder {
            this._features.trafficLayer = this._makeItem(TrafficLayer, enable);
            return this;
        }
        private _makeZoom(level: OSFramework.Enum.OSMap.Zoom): FeatureBuilder {
            this._features.zoom = this._makeItem(Zoom, level);
            return this;
        }

        public build(): void {
            const config = this._map
                .config as Configuration.OSMap.GoogleMapConfig;

            this._makeTrafficLayer(config.showTraffic)
                ._makeZoom(config.zoom)
                ._makeCenter(
                    config.center as OSFramework.OSStructures.OSMap.Coordinates
                )
                ._makeDirections()
                ._makeOffset(config.offset)
                ._makeMarkerClusterer(config.markerClusterer)
                ._makeInfoWindow();

            super.build();
        }
    }
}
