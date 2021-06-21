// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace OSFramework.OSStructures {
    /** Return Message that is sent to Service Studio */
    export class ReturnMessage {
        public code: Enum.ReturnCodes;
        public message: string;
    }
}
