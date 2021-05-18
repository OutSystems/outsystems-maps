// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace OSFramework.Feature {
    export interface ITrafficLayer {
        isEnabled: boolean;
        setState(value: boolean): void;
    }
}
