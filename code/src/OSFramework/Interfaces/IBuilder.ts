// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace OSFramework.Interface {
    /**
     * Defines the interface for buildable objects
     */
    /* eslint-disable @typescript-eslint/no-unused-vars */
    export interface IBuilder {
        /**
         * Build object, instantiating dependencies, and manipulating DOM when necessary
         */
        build(): void;
    }
}
