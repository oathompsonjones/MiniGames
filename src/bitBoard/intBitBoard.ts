import BitBoard from "./bitBoard.js";

/** Represents a BitBoard which uses just one 32-bit number. */
export default class IntBitBoard extends BitBoard<number> {
    /**
     * Creates an instance of NumberBitBoard.
     * @param data - The data to fill the BitBoard with.
     */
    public constructor(data: number = 0) {
        super(data);
    }

    /**
     * Gets the value of a given bit.
     * @param bit - The bit to get.
     * @returns The value of the bit.
     */
    public getBit(bit: number): 0 | 1 {
        return (this._data >>> bit & 1) as 0 | 1;
    }

    /**
     * Sets the value for a given bit to 1.
     * @param bit - The bit to set.
     */
    public setBit(bit: number): void {
        const mask = 1 << bit;

        this._data |= mask;
    }

    /**
     * Sets the value for a given bit to 0.
     * @param bit - The bit to clear.
     */
    public clearBit(bit: number): void {
        const mask = ~(1 << bit);

        this._data &= mask;
    }

    /**
     * Toggles the data for a given bit between 0 and 1.
     * @param bit - The bit to toggle.
     */
    public toggleBit(bit: number): void {
        const mask = 1 << bit;

        this._data ^= mask;
    }

    /** Sets all bits to 0. */
    public clearAll(): void {
        this._data = 0;
    }

    /** Sets all bits to 1. */
    public setAll(): void {
        this._data = ~0 >>> 0;
    }

    /**
     * Gets a given number of bits.
     * @param LSB - The least significant bit to get.
     * @param numberOfBits - The number of bits to get.
     * @returns The bits as a number.
     */
    public getBits(LSB: number, numberOfBits: number): number {
        const mask = 2 ** numberOfBits - 1 << LSB;
        const bits = (this._data & mask) >>> LSB;

        return bits;
    }

    /**
     * Carries out an in-place bitwise and (&) operation on this board and the one provided.
     * @param right - The other bitboard.
     * @returns The result of the operation.
     */
    public and(right: IntBitBoard | number): IntBitBoard {
        return new IntBitBoard(this._data & (right instanceof IntBitBoard ? right.data : right));
    }

    /**
     * Carries out an in-place bitwise or (|) operation on this board and the one provided.
     * @param right - The other bitboard.
     * @returns The result of the operation.
     */
    public or(right: IntBitBoard | number): IntBitBoard {
        return new IntBitBoard(this._data | (right instanceof IntBitBoard ? right.data : right));
    }

    /**
     * Carries out an in-place bitwise xor (^) operation on this board and the one provided.
     * @param right - The other bitboard.
     * @returns The result of the operation.
     */
    public xor(right: IntBitBoard | number): IntBitBoard {
        return new IntBitBoard(this._data ^ (right instanceof IntBitBoard ? right.data : right));
    }

    /**
     * Carries out an in-place bitwise not (~) operation on this board.
     * @returns The result of the operation.
     */
    public not(): IntBitBoard {
        return new IntBitBoard(~this._data);
    }

    /**
     * Carries out an in-place bitwise left shift (<<) operation on this board.
     * @param shiftAmount - The amount to shift by.
     * @returns The result of the operation.
     */
    public leftShift(shiftAmount: number): IntBitBoard {
        return new IntBitBoard(this._data << shiftAmount);
    }

    /**
     * Carries out an in-place bitwise unsigned right shift (>>>) operation on this board.
     * @param shiftAmount - The amount to shift by.
     * @returns The result of the operation.
     */
    public rightShift(shiftAmount: number): IntBitBoard {
        return new IntBitBoard(this._data >>> shiftAmount);
    }

    /**
     * Carries out an in-place bitwise arithmetic right shift (>>) operation on this board.
     * @param shiftAmount - The amount to shift by.
     * @returns The result of the operation.
     */
    public arithmeticRightShift(shiftAmount: number): IntBitBoard {
        return new IntBitBoard(this._data >> shiftAmount);
    }

    /**
     * Checks if the current bitboard is equal to another.
     * @param value - The other bitboard.
     * @returns Whether or not the bitboards are equal.
     */
    public equals(value: IntBitBoard | number): boolean {
        return this._data === (value instanceof IntBitBoard ? value._data : value);
    }
}
