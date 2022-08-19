/// <reference path="./DrawConfig.ts" />

// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace Provider.Maps.Leaflet.Configuration.DrawingTools {
    export class DrawMarkerConfig extends DrawConfig {
        public iconUrl: string;
        //TODO - check if its feasible and makes sense the creation of iconSize attribute.
    }
}
