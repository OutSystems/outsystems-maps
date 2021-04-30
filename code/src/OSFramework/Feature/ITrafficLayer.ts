namespace OSFramework.Feature {
    export interface ITrafficLayer {
        isEnabled: boolean;
        setState(value: boolean): void;
        // isActive: boolean;
    }
}
