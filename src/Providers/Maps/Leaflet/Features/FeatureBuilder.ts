// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace Provider.Maps.Leaflet.Feature {
    export interface IFeatures {
        features: OSFramework.Maps.Feature.ExposedFeatures;
        dispose(): void;
    }

    export abstract class AbstractFactoryBuilder
        implements IFeatures, OSFramework.Maps.Interface.IBuilder
    {
        protected _featureList: OSFramework.Maps.Interface.IBuilder[];
        protected _features: OSFramework.Maps.Feature.ExposedFeatures;
        protected _map: OSFramework.Maps.OSMap.IMap;

        constructor(map: OSFramework.Maps.OSMap.IMap) {
            this._map = map;
            this._featureList = [];
            this._features = new OSFramework.Maps.Feature.ExposedFeatures();
        }

        // eslint-disable-next-line @typescript-eslint/naming-convention
        private _instanceOfIDisposable(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            object: any
        ): object is OSFramework.Maps.Interface.IDisposable {
            return 'dispose' in object;
        }

        protected _makeItem<T extends OSFramework.Maps.Interface.IBuilder>(
            c: new (...args: unknown[]) => T,
            // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
            ...args: unknown[]
        ): T {
            const o = new c(this._map, ...args);
            this._featureList.push(o);
            return o;
        }

        public get features(): OSFramework.Maps.Feature.ExposedFeatures {
            return this._features;
        }

        public build(): void {
            this._featureList.forEach((p) => p.build());
        }

        public dispose(): void {
            this._featureList.forEach((p) => {
                this._instanceOfIDisposable(p) &&
                    (p as OSFramework.Maps.Interface.IDisposable).dispose();
                p = undefined;
            });
        }
    }

    export class FeatureBuilder extends AbstractFactoryBuilder {
        private _makeCenter(
            center: OSFramework.Maps.OSStructures.OSMap.Coordinates
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
        private _makeOffset(
            offset: OSFramework.Maps.OSStructures.OSMap.Offset
        ): FeatureBuilder {
            this._features.offset = this._makeItem(Offset, offset);
            return this;
        }
        private _makeShape(): FeatureBuilder {
            this._features.shape = this._makeItem(Shape);
            return this;
        }
        private _makeZoom(
            level: OSFramework.Maps.Enum.OSMap.Zoom
        ): FeatureBuilder {
            this._features.zoom = this._makeItem(Zoom, level);
            return this;
        }

        public build(): void {
            const config = this._map
                .config as Configuration.OSMap.LeafletMapConfig;

            this._makeShape();
            this._makeZoom(config.zoom)
                ._makeCenter(
                    config.center as OSFramework.Maps.OSStructures.OSMap.Coordinates
                )
                ._makeDirections()
                ._makeOffset(config.offset)
                ._makeInfoWindow();

            super.build();
        }
    }
}
