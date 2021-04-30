namespace OSFramework.Feature {
    export interface IOffset {
        getOffset: OSStructures.OSMap.Offset;
        isAutoFit: boolean;
        setOffset(value: OSStructures.OSMap.Offset): void;
        setAutoFit(state: boolean): void
    }
}
