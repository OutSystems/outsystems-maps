// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace OSFramework.OSStructures.OSMap {
    export class MarkerClusterer {
        public active: boolean;
        public clusterClass: string;
        public maxZoom: number;
        public minClusterSize: number;
        public styles: Array<OSStructures.Clusterer.Style>;
        public zoomOnClick: boolean;
    }
}
