// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace OSFramework.OSStructures {
    /** Return Message that is sent to Service Studio */
    export class ReturnMessage {
        public code?: Enum.ErrorCodes;
        public isSuccess?: boolean;
        public message?: string;
    }
}
