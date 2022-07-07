declare module "leb" {
    function decodeInt32(
        encodedBuffer: any,
        index: any
    ): {
        value: number;
        nextIndex: any;
    };
    function decodeInt64(
        encodedBuffer: any,
        index: any
    ): {
        value: number;
        nextIndex: any;
        lossy: boolean;
    };
    function decodeIntBuffer(
        encodedBuffer: any,
        index: any
    ): {
        value: any;
        nextIndex: any;
    };
    function decodeUInt32(
        encodedBuffer: any,
        index: any
    ): {
        value: number;
        nextIndex: any;
    };
    function decodeUInt64(
        encodedBuffer: any,
        index: any
    ): {
        value: number;
        nextIndex: any;
        lossy: boolean;
    };
    function decodeUIntBuffer(
        encodedBuffer: any,
        index: any
    ): {
        value: any;
        nextIndex: any;
    };
    function encodeInt32(num: any): any;
    function encodeInt64(num: any): any;
    function encodeIntBuffer(buffer: any): any;
    function encodeUInt32(num: any): any;
    function encodeUInt64(num: any): any;
    function encodeUIntBuffer(buffer: any): any;
}
