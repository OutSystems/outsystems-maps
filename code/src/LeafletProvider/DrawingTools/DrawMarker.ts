/// <reference path="AbstractProviderTool.ts" />

// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace LeafletProvider.DrawingTools {
    export class DrawMarker extends AbstractProviderTool<Configuration.DrawingTools.DrawMarkerConfig> {
        constructor(
            map: OSFramework.OSMap.IMap,
            drawingTools: OSFramework.DrawingTools.IDrawingTools,
            drawingToolsId: string,
            type: string,
            // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
            configs: any
        ) {
            super(
                map,
                drawingTools,
                drawingToolsId,
                type,
                new Configuration.DrawingTools.DrawMarkerConfig(configs)
            );
        }

        private _setOnChangeEvent(_marker: OSFramework.Marker.IMarker): void {
            _marker.markerEvents.addHandler(
                // changing the marker location is only available via the drag-and-drop, so the solution passes by adding the dragend event listener as the marker's OnChanged event
                'dragend' as OSFramework.Event.Marker.MarkerEventType,
                // Trigger the onDrawingChangeEvent with the extra information (marker uniqueId and flag indicating that the element is not new)
                () => this.triggerOnDrawingChangeEvent(_marker.uniqueId, false)
            );
        }

        /** Get the constant for the event markercomplete */
        protected get completedToolEventName(): string {
            return OSFramework.Helper.Constants.drawingMarkerCompleted;
        }

        protected get options(): google.maps.MarkerOptions {
            return this.drawingTools.provider.get('markerOptions');
        }

        protected set options(options: google.maps.MarkerOptions) {
            const allOptions = { ...this.options, ...options };
            this.drawingTools.provider.setOptions({
                markerOptions: allOptions
            });
        }

        protected createElement(
            uniqueId: string,
            marker: google.maps.Marker,
            // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
            configs: any
        ): OSFramework.Marker.IMarker {
            const location = `${marker.getPosition().lat()},${marker
                .getPosition()
                .lng()}`;

            // Join both the configs that were provided for the new marker element and the location that was provided by the DrawingTools markercomplete event
            const finalConfigs = { ...configs, location };

            const _marker = Marker.MarkerFactory.MakeMarker(
                this.map,
                uniqueId,
                OSFramework.Enum.MarkerType.Marker,
                finalConfigs
            );

            // Add the onChange event to the new element
            this._setOnChangeEvent(_marker);
            // Add the new element to the map
            this.map.addMarker(_marker);
            return _marker;
        }

        public build(): void {
            super.build();
        }

        // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
        public changeProperty(propertyName: string, value: any): void {
            const propValue = OSFramework.Enum.OS_Config_Marker[propertyName];
            super.changeProperty(propertyName, value);
            if (this.drawingTools.isReady) {
                switch (propValue) {
                    case OSFramework.Enum.OS_Config_Marker.iconUrl:
                        this.options = { icon: value };
                        return;
                }
            }
        }
    }
}
