import BitBoard from "./bitBoard.js";
import LongInt from "./longInt.js";

/** A BitBoard which uses an array of 32-bit numbers. */
export default class LongIntBitBoard extends BitBoard<LongInt> {
    /**
     * Creates an instance of LongIntBitBoard.
     * @param longInt - The data to fill the BitBoard with.
     */
    public constructor(longInt: LongInt);
    /**
     * Creates an instance of LongIntBitBoard.
     * @param uint32Array - The data to fill the BitBoard with.
     */
    public constructor(uint32Array: Uint32Array);
    /**
     * Creates an instance of LongIntBitBoard.
     * @param numberArray - The data to fill the BitBoard with.
     */
    public constructor(numberArray: number[]);
    /**
     * Creates an instance of LongIntBitBoard.
     * @param length - The length of the LongInt array.
     */
    public constructor(length: number);
    /**
     * Creates an instance of LongIntBitBoard.
     * @param args - The data to fill the BitBoard with.
     */
    public constructor(args?: LongInt | number[] | Uint32Array | number) {
        switch (true) {
            case args === undefined:
                super(new LongInt(Array(2).fill(0)));
                break;
            case args instanceof LongInt:
                super(args);
                break;
            case args instanceof Uint32Array || args instanceof Array:
                super(new LongInt(args));
                break;
            case typeof args === "number":
                super(new LongInt(Array(args).fill(0)));
                break;
            default:
                throw new Error("Invalid constructor arguments.");
        }
    }

    /**
     * Gets the value of a given bit.
     * @param bit - The bit to get.
     * @returns The value of the bit.
     */
    public getBit(bit: number): 0 | 1 {
        return LongInt.rightShift(this._data, bit).and(1).data[0] as 0 | 1;
    }

    /**
     * Sets the value for a given bit to 1.
     * @param bit - The bit to set.
     */
    public setBit(bit: number): void {
        const mask = LongInt.getMatchingLongInt(this._data, 1)
            .leftShift(bit);

        this._data.or(mask);
    }

    /**
     * Sets the value for a given bit to 0.
     * @param bit - The bit to clear.
     */
    public clearBit(bit: number): void {
        const mask = LongInt.getMatchingLongInt(this._data, 1)
            .leftShift(bit)
            .not();

        this._data.and(mask);
    }

    /**
     * Toggles the data for a given bit between 0 and 1.
     * @param bit - The bit to toggle.
     */
    public toggleBit(bit: number): void {
        const mask = LongInt.getMatchingLongInt(this._data, 1)
            .leftShift(bit);

        this._data.xor(mask);
    }

    /** Sets all bits to 0. */
    public clearAll(): void {
        for (let i = 0; i < this._data.data.length; i++)
            this._data.data[i] = 0;
    }

    /** Sets all bits to 1. */
    public setAll(): void {
        for (let i = 0; i < this._data.data.length; i++)
            this._data.data[i] = ~0 >>> 0;
    }

    /**
     * Gets a given number of bits.
     * @param LSB - The least significant bit to get.
     * @param numberOfBits - The number of bits to get.
     * @returns The bits as a number.
     */
    public getBits(LSB: number, numberOfBits: number): LongInt {
        const arr: number[] = [];
        const arrLength = Math.ceil(numberOfBits / 32);

        for (let i = 0; i < arrLength - 1; i++)
            arr[i] = ~0 >>> 0;
        arr[arrLength - 1] = 2 ** (numberOfBits - (arrLength - 1) * 32) - 1;
        const mask = LongInt.getMatchingLongInt(this._data, arr).leftShift(LSB);
        const bits = LongInt.rightShift(LongInt.and(this._data, mask), LSB);

        return bits;
    }

    /**
     * Carries out a bitwise and (&) operation.
     * @param right - The right value.
     * @returns The result.
     */
    public and(right: LongIntBitBoard | number): LongIntBitBoard {
        return new LongIntBitBoard(LongInt.and(this._data, right instanceof LongIntBitBoard ? right.data : right));
    }

    /**
     * Carries out a bitwise or (|) operation.
     * @param right - The right value.
     * @returns The result.
     */
    public or(right: LongIntBitBoard | number): LongIntBitBoard {
        return new LongIntBitBoard(LongInt.or(this._data, right instanceof LongIntBitBoard ? right.data : right));
    }

    /**
     * Carries out a bitwise xor (^) operation.
     * @param right - The right value.
     * @returns The result.
     */
    public xor(right: LongIntBitBoard | number): LongIntBitBoard {
        return new LongIntBitBoard(LongInt.xor(this._data, right instanceof LongIntBitBoard ? right.data : right));
    }

    /**
     * Carries out a bitwise not (~) operation.
     * @returns The result.
     */
    public not(): LongIntBitBoard {
        return new LongIntBitBoard(LongInt.not(this._data));
    }

    /**
     * Carries out a bitwise left shift (<<) operation.
     * @param shiftAmount - How much to shift it by.
     * @returns The result.
     */
    public leftShift(shiftAmount: number): LongIntBitBoard {
        return new LongIntBitBoard(LongInt.leftShift(this._data, shiftAmount));
    }

    /**
     * Carries out a bitwise logical right shift (>>>) operation.
     * @param shiftAmount - How much to shift it by.
     * @returns The result.
     */
    public rightShift(shiftAmount: number): LongIntBitBoard {
        return new LongIntBitBoard(LongInt.rightShift(this._data, shiftAmount));
    }

    /**
     * Carries out a bitwise arithmetic right shift (>>) operation.
     * @param shiftAmount - How much to shift it by.
     * @returns The result.
     */
    public arithmeticRightShift(shiftAmount: number): LongIntBitBoard {
        return new LongIntBitBoard(LongInt.arithmeticRightShift(this._data, shiftAmount));
    }

    /**
     * Checks if two BitBoards have equal data values.
     * @param value - The value to compare against.
     * @returns Whether or not the two BitBoard have the same data value.
     */
    public equals(value: LongInt | LongIntBitBoard | number): boolean {
        return this._data.equals(value instanceof LongIntBitBoard ? value._data : value);
    }
}
