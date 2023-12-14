// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace OSFramework.Maps.DrawingTools {
    export interface IDrawingToolsProvider {
        addListener?(
            eventName: string,
            cb: OSFramework.Maps.Callbacks.Generic
        ): void;
        get?(name: string): unknown;
        getPosition?(): unknown;
        setDrawingOptions?(options: unknown): void;
        setOptions?(options: unknown): void;
    }
}
