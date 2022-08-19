/// <reference path="../../../../../OSFramework/Maps/Configuration/AbstractConfiguration.ts" />

// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace Provider.Maps.Leaflet.Configuration.DrawingTools {
    export class DrawConfig
        extends OSFramework.Maps.Configuration.AbstractConfiguration
        implements OSFramework.Maps.Configuration.IConfigurationTool
    {
        public allowDrag: boolean;
        public uniqueId: string;

        constructor(
            config:
                | Configuration.DrawingTools.DrawFilledShapeConfig
                | Configuration.DrawingTools.DrawBasicShapeConfig
                | Configuration.DrawingTools.DrawMarkerConfig
        ) {
            super(config);
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        public getProviderConfig(): any {
            // eslint-disable-next-line prefer-const
            let provider = {
                repeatMode: false // allows to create drawing shapes without unselect the tool
                /* WARNING: repeatMode is false because there is an issue when we are working with rectangle or circle tools.
                    Those two tools need the drag/touch event to build the shapes.
                    Bug:    If the user wants to cancel the selected tool it will ignore that and build the shape.
                            The only way to cancel the active drawing mode is by choosing another tool and cancel that one.
                */
            };

            //Deleting all the undefined properties
            Object.keys(provider).forEach((key) => {
                if (provider[key] === undefined) delete provider[key];
            });

            return provider;
        }
    }
}
