import { BitBoard, LongInt } from "./";

/**
 * A BitBoard which uses an array of 32-bit numbers.
 *
 * @class LongIntBitBoard
 * @typedef {LongIntBitBoard}
 * @extends {BitBoard<Width, Height, LongInt>}
 */
export class LongIntBitBoard extends BitBoard<LongInt> {
    /**
     * Creates an instance of LongIntBitBoard.
     *
     * @constructor
     * @public
     * @param {LongInt} [longInt=new LongInt(Array<number>(2).fill(0))] The data to fill the BitBoard with.
    */
    public constructor(longInt: LongInt);
    /**
     * Creates an instance of LongIntBitBoard.
     *
     * @constructor
     * @public
     * @param {number} [length=2] The length of the LongInt.
     */
    public constructor(length: number);
    public constructor(args?: LongInt | number) {
        if (args === undefined)
            super(new LongInt(Array<number>(2).fill(0)));
        else if (typeof args === "number")
            super(new LongInt(Array<number>(args).fill(0)));
        else if (args instanceof LongInt)
            super(args);
    }

    public getBit(bit: number): 0 | 1 {
        return LongInt.rightShift(this._data, bit).and(1).data[0] as 0 | 1;
    }


    public setBit(bit: number): void {
        const mask = LongInt.getMatchingLongInt(this._data, 1)
            .leftShift(bit);
        this._data.or(mask);
    }

    public clearBit(bit: number): void {
        const mask = LongInt.getMatchingLongInt(this._data, 1)
            .leftShift(bit)
            .not();
        this._data.and(mask);
    }

    public toggleBit(bit: number): void {
        const mask = LongInt.getMatchingLongInt(this._data, 1)
            .leftShift(bit);
        this._data.xor(mask);
    }

    public clearAll(): void {
        for (let i = 0; i < this._data.data.length; i++)
            this._data.data[i] = 0;
    }

    public setAll(): void {
        for (let i = 0; i < this._data.data.length; i++)
            this._data.data[i] = ~0 >>> 0;
    }

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

    public and(right: LongIntBitBoard | number): this {
        return new LongIntBitBoard(LongInt.and(this._data, right instanceof LongIntBitBoard ? right.data : right)) as this;
    }

    public or(right: LongIntBitBoard | number): this {
        return new LongIntBitBoard(LongInt.or(this._data, right instanceof LongIntBitBoard ? right.data : right)) as this;
    }

    public xor(right: LongIntBitBoard | number): this {
        return new LongIntBitBoard(LongInt.xor(this._data, right instanceof LongIntBitBoard ? right.data : right)) as this;
    }

    public not(): this {
        return new LongIntBitBoard(LongInt.not(this._data)) as this;
    }

    public leftShift(shiftAmount: number): this {
        return new LongIntBitBoard(LongInt.leftShift(this._data, shiftAmount)) as this;
    }

    public rightShift(shiftAmount: number): this {
        return new LongIntBitBoard(LongInt.rightShift(this._data, shiftAmount)) as this;
    }

    public arithmeticRightShift(shiftAmount: number): this {
        return new LongIntBitBoard(LongInt.arithmeticRightShift(this._data, shiftAmount)) as this;
    }

    public equals(value: LongInt | LongIntBitBoard | number): boolean {
        return this._data.equals(value instanceof LongIntBitBoard ? value._data : value);
    }
}
