declare module "bits" {
    /**
     * Extracts the given number of bits from the buffer at the indicated
     * index, returning a simple number as the result. If bits are requested
     * that aren't covered by the buffer, the `defaultBit` is used as their
     * value.
     *
     * The `bitLength` must be no more than 32. The `defaultBit` if not
     * specified is taken to be `0`.
     */
    function extract(buffer: any, bitIndex: any, bitLength: any, defaultBit: any): number;
    /**
     * Injects the given bits into the given buffer at the given index. Any
     * bits in the value beyond the length to set are ignored.
     */
    function inject(buffer: any, bitIndex: any, bitLength: any, value: any): void;
    /**
     * Gets the sign bit of the given buffer.
     */
    function getSign(buffer: any): number;
    /**
     * Gets the zero-based bit number of the highest-order bit with the
     * given value in the given buffer.
     *
     * If the buffer consists entirely of the other bit value, then this returns
     * `-1`.
     */
    function highOrder(bit: any, buffer: any): number;
}
