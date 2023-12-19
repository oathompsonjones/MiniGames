import type LongInt from "./LongInt.js";
import type { StringType } from "./LongInt.js";

/**
 * Represents a BitBoard.
 *
 * @link https://en.wikipedia.org/wiki/Bitboard
 */
export default abstract class BitBoard<T extends LongInt | number = LongInt | number> {
    /**
     * The numeric data.
     */
    protected _data: T;

    /**
     * Creates an instance of BitBoard.
     *
     * @param data The data to assign to the BitBoard.
     */
    protected constructor(data: T) {
        this._data = data;
    }

    /**
     * Gets the numeric data.
     */
    public get data(): T {
        return this._data;
    }

    /**
     * Returns a string representation of the BitBoard.
     *
     * @param type The base of the string to print.
     * @returns The string representation.
     */
    public toString(type: StringType = 16): string {
        let padLength = 0;
        switch (type) {
            case 2:
                padLength = 32;
                break;
            case 10:
                padLength = 10;
                break;
            case 16:
                padLength = 8;
                break;
        }
        return this._data.toString(type).padStart(padLength, "0");
    }

    /**
     * Assigns a given bit a given value.
     *
     * @param bit The x coordinate.
     * @param value The value to assign to the bit.
     */
    public assignBit(bit: number, value: 0 | 1): void {
        return value === 0 ? this.clearBit(bit) : this.setBit(bit);
    }

    /**
     * Gets a given bit, based on it's x, y coordinates.
     *
     * @param bit The index of the bit to get, 0 = LSB.
     * @returns The bit.
     */
    public abstract getBit(bit: number): 0 | 1;

    /**
     * Sets a given bit (changes the value to 1), based on it's x, y coordinates.
     *
     * @param bit The index of the bit to get, 0 = LSB.
     */
    public abstract setBit(bit: number): void;

    /**
     * Clears a given bit (changes the value to 0), based on it's x, y coordinates.
     *
     * @param bit The index of the bit to get, 0 = LSB.
     */
    public abstract clearBit(bit: number): void;

    /**
     * Toggles a given bit (changes the value from 0 to 1 or 1 to 0), based on it's x, y coordinates.
     *
     * @param bit The index of the bit to get, 0 = LSB.
     */
    public abstract toggleBit(bit: number): void;

    /**
     * Clears the whole BitBoard (sets all values to 0).
     */
    public abstract clearAll(): void;

    /**
     * Set the whole BitBoard (sets all values to 1).
     */
    public abstract setAll(): void;

    /**
     * Gets a range of bits.
     *
     * @param LSB The least significant bit.
     * @param numberOfBits The number of bits to get.
     * @returns The range of bits.
     */
    public abstract getBits(LSB: number, numberOfBits: number): T;

    /**
     * Carries out a bitwise and (&) operation.
     *
     * @param right The right value.
     * @returns The result.
     */
    public abstract and(right: BitBoard<T> | T | number): this;

    /**
     * Carries out a bitwise or (|) operation.
     *
     * @param right The right value.
     * @returns The result.
     */
    public abstract or(right: BitBoard<T> | T | number): this;

    /**
     * Carries out a bitwise xor (^) operation.
     *
     * @param right The right value.
     * @returns The result.
     */
    public abstract xor(right: BitBoard<T> | T | number): this;

    /**
     * Carries out a bitwise not (~) operation.
     *
     * @returns The result.
     */
    public abstract not(): this;

    /**
     * Carries out a bitwise left shift (<<) operation.
     *
     * @param shiftAmount How much to shift it by.
     * @returns The result.
     */
    public abstract leftShift(shiftAmount: number): this;

    /**
     * Carries out a bitwise logical right shift (>>>) operation.
     *
     * @param shiftAmount How much to shift it by.
     * @returns The result.
     */
    public abstract rightShift(shiftAmount: number): this;

    /**
     * Carries out a bitwise arithmetic right shift (>>) operation.
     *
     * @param shiftAmount How much to shift it by.
     * @returns The result.
     */
    public abstract arithmeticRightShift(shiftAmount: number): this;

    /**
     * Checks if two BitBoards have equal data values.
     *
     * @param value The value to compare against.
     * @returns Whether or not the two BitBoard have the same data value.
     */
    public abstract equals(value: BitBoard<T> | T | number): boolean;
}
