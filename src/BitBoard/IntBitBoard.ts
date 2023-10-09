import { BitBoard } from "./BitBoard.js";

/**
 * A BitBoard which uses just one 32-bit number.
 *
 * @class NumberBitBoard
 * @typedef {IntBitBoard}
 * @extends {BitBoard<number>}
 */
export class IntBitBoard extends BitBoard<number> {
    /**
     * Creates an instance of NumberBitBoard.
     *
     * @constructor
     * @public
     * @param {number} [data=0] The data to fill the BitBoard with.
     */
    public constructor(data: number = 0) {
        super(data);
    }

    public getBit(bit: number): 0 | 1 {
        return (this._data >>> bit & 1) as 0 | 1;
    }

    public setBit(bit: number): void {
        const mask = 1 << bit;
        this._data |= mask;
    }

    public clearBit(bit: number): void {
        const mask = ~(1 << bit);
        this._data &= mask;
    }

    public toggleBit(bit: number): void {
        const mask = 1 << bit;
        this._data ^= mask;
    }

    public clearAll(): void {
        this._data = 0;
    }

    public setAll(): void {
        this._data = ~0 >>> 0;
    }

    public getBits(LSB: number, numberOfBits: number): number {
        const mask = 2 ** numberOfBits - 1 << LSB;
        const bits = (this._data & mask) >>> LSB;
        return bits;
    }

    public and(right: IntBitBoard | number): this {
        return new IntBitBoard(this._data & (right instanceof IntBitBoard ? right.data : right)) as this;
    }

    public or(right: IntBitBoard | number): this {
        return new IntBitBoard(this._data | (right instanceof IntBitBoard ? right.data : right)) as this;
    }

    public xor(right: IntBitBoard | number): this {
        return new IntBitBoard(this._data ^ (right instanceof IntBitBoard ? right.data : right)) as this;
    }

    public not(): this {
        return new IntBitBoard(~this._data) as this;
    }

    public leftShift(shiftAmount: number): this {
        return new IntBitBoard(this._data << shiftAmount) as this;
    }

    public rightShift(shiftAmount: number): this {
        return new IntBitBoard(this._data >>> shiftAmount) as this;
    }

    public arithmeticRightShift(shiftAmount: number): this {
        return new IntBitBoard(this._data >> shiftAmount) as this;
    }

    public equals(value: IntBitBoard | number): boolean {
        return this._data === (value instanceof IntBitBoard ? value._data : value);
    }
}
