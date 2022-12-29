import type { LongInt } from "./";
import { StringType } from "../Utils";

/**
 * A BitBoard.
 *
 * @link https://en.wikipedia.org/wiki/Bitboard
 * @abstract
 * @class BitBoard
 * @typedef {BitBoard}
 * @template Width extends number
 * @template Height extends number
 * @template DataType extends LongInt | number = LongInt | number
 */
export abstract class BitBoard<DataType extends LongInt | number = LongInt | number> {
    /**
     * The numeric data.
     *
     * @protected
     * @type {DataType}
     */
    protected _data: DataType;

    /**
     * Creates an instance of BitBoard.
     *
     * @constructor
     * @protected
     * @param {DataType} data The data to assign to the BitBoard.
     */
    protected constructor(data: DataType) {
        this._data = data;
    }

    /**
     * Gets the numeric data.
     *
     * @public
     * @readonly
     * @type {DataType}
     */
    public get data(): DataType {
        return this._data;
    }

    /**
     * Returns a string representation of the BitBoard.
     *
     * @public
     * @param {StringType} [type=StringType.Hex] The base of the string to print.
     * @returns {string} The string representation.
     */
    public toString(type: StringType = StringType.Hex): string {
        let padLength = 0;
        switch (type) {
            case StringType.Binary:
                padLength = 32;
                break;
            case StringType.Decimal:
                padLength = 10;
                break;
            case StringType.Hex:
                padLength = 8;
                break;
        }
        return this._data.toString(type).padStart(padLength, "0");
    }

    /**
     * Assigns a given bit a given value.
     *
     * @public
     * @param {number} bit The x coordinate.
     * @param {0 | 1} value The value to assign to the bit.
     */
    public assignBit(bit: number, value: 0 | 1): void {
        return value === 0 ? this.clearBit(bit) : this.setBit(bit);
    }

    /**
     * Gets a given bit, based on it's x, y coordinates.
     *
     * @public
     * @param {number} bit The index of the bit to get, 0 = LSB.
     * @returns {0 | 1} The bit.
     */
    public abstract getBit(bit: number): 0 | 1;

    /**
     * Sets a given bit (changes the value to 1), based on it's x, y coordinates.
     *
     * @public
     * @param {number} bit The index of the bit to get, 0 = LSB.
     */
    public abstract setBit(bit: number): void;

    /**
     * Clears a given bit (changes the value to 0), based on it's x, y coordinates.
     *
     * @public
     * @param {number} bit The index of the bit to get, 0 = LSB.
     */
    public abstract clearBit(bit: number): void;

    /**
     * Toggles a given bit (changes the value from 0 to 1 or 1 to 0), based on it's x, y coordinates.
     *
     * @public
     * @param {number} bit The index of the bit to get, 0 = LSB.
     */
    public abstract toggleBit(bit: number): void;

    /**
     * Clears the whole BitBoard (sets all values to 0).
     *
     * @public
     */
    public abstract clearAll(): void;

    /**
     * Set the whole BitBoard (sets all values to 1).
     *
     * @public
     */
    public abstract setAll(): void;

    /**
     * Gets a range of bits.
     *
     * @public
     * @abstract
     * @param {number} LSB The least significant bit.
     * @param {number} numberOfBits The number of bits to get.
     * @returns {BitBoard<DataType>} The range of bits.
     */
    public abstract getBits(LSB: number, numberOfBits: number): DataType;

    /**
     * Carries out a bitwise and (&) operation.
     *
     * @public
     * @abstract
     * @param {(BitBoard<DataType> | number)} right The right value.
     * @returns {BitBoard<DataType>} The result.
     */
    public abstract and(right: BitBoard<DataType> | DataType | number): BitBoard<DataType>;

    /**
     * Carries out a bitwise or (|) operation.
     *
     * @public
     * @abstract
     * @param {(BitBoard<DataType> | number)} right The right value.
     * @returns {BitBoard<DataType>} The result.
     */
    public abstract or(right: BitBoard<DataType> | DataType | number): BitBoard<DataType>;

    /**
     * Carries out a bitwise xor (^) operation.
     *
     * @public
     * @abstract
     * @param {(BitBoard<DataType> | number)} right The right value.
     * @returns {BitBoard<DataType>} The result.
     */
    public abstract xor(right: BitBoard<DataType> | DataType | number): BitBoard<DataType>;

    /**
     * Carries out a bitwise not (~) operation.
     *
     * @public
     * @abstract
     * @returns {BitBoard<DataType>} The result.
     */
    public abstract not(): BitBoard<DataType>;

    /**
     * Carries out a bitwise left shift (<<) operation.
     *
     * @public
     * @abstract
     * @param {number} shiftAmount How much to shift it by.
     * @returns {BitBoard<DataType>} The result.
     */
    public abstract leftShift(shiftAmount: number): BitBoard<DataType>;

    /**
     * Carries out a bitwise logical right shift (>>>) operation.
     *
     * @public
     * @abstract
     * @param {number} shiftAmount How much to shift it by.
     * @returns {BitBoard<DataType>} The result.
     */
    public abstract rightShift(shiftAmount: number): BitBoard<DataType>;

    /**
     * Carries out a bitwise arithmetic right shift (>>) operation.
     *
     * @public
     * @abstract
     * @param {number} shiftAmount How much to shift it by.
     * @returns {BitBoard<DataType>} The result.
     */
    public abstract arithmeticRightShift(shiftAmount: number): BitBoard<DataType>;

    /**
     * Checks if two BitBoards have equal data values.
     *
     * @public
     * @abstract
     * @param {(BitBoard<DataType> | DataType | number)} value The value to compare against.
     * @returns {boolean} Whether or not the two BitBoard have the same data value.
     */
    public abstract equals(value: BitBoard<DataType> | DataType | number): boolean;
}
