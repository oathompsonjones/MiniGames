export const enum StringType {
    BINARY = 2,
    DECIMAL = 10,
    HEXADECIMAL = 16,
}

/**
 * Represents a long integer using an array of 32-bit numbers.
 * Provides static methods for bitwise operations which do not modify the original values.
 * Provides non-static equivalents to the above operations, which are carried out in place.
 */
export default class LongInt {
    /** Holds the array of 32-bit numbers. */
    public readonly data: Uint32Array;

    /**
     * Creates an instance of LongInt.
     * @param values - A little-endian array of 32-bit numbers to fill the `LongInt`.
     */
    public constructor(values: number[] | Uint32Array);
    /**
     * Creates an instance of LongInt.
     * @param length - The number of 32-bit numbers to construct the `LongInt` out of.
     */
    public constructor(length: number);
    /**
     * Creates an instance of LongInt.
     * @param longInt - A `LongInt` object to duplicate.
     */
    public constructor(longInt: LongInt);
    /**
     * Creates an instance of LongInt.
     * @param args - The arguments to construct the `LongInt` out of.
     */
    public constructor(args: LongInt | number[] | Uint32Array | number) {
        if (args instanceof Array || args instanceof Uint32Array)
            this.data = new Uint32Array(args);
        else if (args instanceof LongInt)
            this.data = new Uint32Array(args.data);
        else
            this.data = new Uint32Array(args).fill(0);
    }

    /**
     * Gets the number of 32-bit words which make the LongInt.
     * @returns The number of words.
     */
    public get wordCount(): number {
        return this.data.length;
    }

    /**
     * Carries out a bitwise and (&) operation on the two numbers.
     * @param left - The left number.
     * @param right - The right number.
     * @returns The result of left & right.
     */
    public static and(left: LongInt, right: LongInt | number): LongInt {
        return new LongInt(left).and(right);
    }

    /**
     * Carries out a bitwise or (|) operation on the two numbers.
     * @param left - The left number.
     * @param right - The right number.
     * @returns The result of left | right.
     */
    public static or(left: LongInt, right: LongInt | number): LongInt {
        return new LongInt(left).or(right);
    }

    /**
     * Carries out a bitwise xor (^) operation on the two numbers.
     * @param left - The left number.
     * @param right - The right number.
     * @returns The result of left ^ right.
     */
    public static xor(left: LongInt, right: LongInt | number): LongInt {
        return new LongInt(left).xor(right);
    }

    /**
     * Carries out a bitwise not (~) operation on the number.
     * @param number - The number to negate.
     * @returns The result of ~number.
     */
    public static not(number: LongInt): LongInt {
        return new LongInt(number).not();
    }

    /**
     * Carries out a bitwise left shift (<<) operation on the number.
     * @param number - The number to shift.
     * @param shiftAmount - The number of places to shift.
     * @returns The result of number << shiftAmount.
     */
    public static leftShift(number: LongInt, shiftAmount: number): LongInt {
        return new LongInt(number).leftShift(shiftAmount);
    }

    /**
     * Carries out a bitwise unsigned right shift (>>>) operation on the number.
     * @param number - The number to shift.
     * @param shiftAmount - The number of places to shift.
     * @returns The result of number >>> shiftAmount.
     */
    public static rightShift(number: LongInt, shiftAmount: number): LongInt {
        return new LongInt(number).rightShift(shiftAmount);
    }

    /**
     * Carries out a bitwise arithmetic right shift (>>) operation on the number.
     * @param number - The number to shift.
     * @param shiftAmount - The number of places to shift.
     * @returns The result of number >> shiftAmount.
     */
    public static arithmeticRightShift(number: LongInt, shiftAmount: number): LongInt {
        return new LongInt(number).arithmeticRightShift(shiftAmount);
    }

    /**
     * Determines whether or not 2 LongInts have equal values.
     * @param longInt1 - The first LongInt.
     * @param longInt2 - The second LongInt (can also be a number).
     * @returns Whether or not they are equal.
     */
    public static equals(longInt1: LongInt, longInt2: LongInt | number): boolean {
        return longInt1.equals(longInt2);
    }

    /**
     * Creates a new LongInt object with the given value, stretched or truncated to the same size as this.
     * @param longInt - The LongInt to match the dimensions of.
     * @param value - The LongInt object to use as the value.
     * @returns The new LongInt.
     */
    public static getMatchingLongInt(longInt: LongInt, value: LongInt): LongInt;
    /**
     * Creates a new LongInt object using the given value, stretched or truncated to the same size as this.
     * @param longInt - The LongInt to match the dimensions of.
     * @param values - An array of 32-bit numbers to use as the value.
     * @returns The new LongInt.
     */
    public static getMatchingLongInt(longInt: LongInt, values: number[] | Uint32Array): LongInt;
    /**
     * Creates a new LongInt object using the given value, stretched or truncated to the same size as this.
     * @param longInt - The LongInt to match the dimensions of.
     * @param value - A 32-bit number to use as the value.
     * @returns The new LongInt.
     */
    public static getMatchingLongInt(longInt: LongInt, value?: number): LongInt;
    /**
     * Creates a LongInt with the same dimensions as this one, using the given input.
     * @param longInt - The LongInt to match the dimensions of.
     * @param value - The value of the LongInt to create.
     * @returns The new LongInt.
     */
    public static getMatchingLongInt(longInt: LongInt, value: LongInt | number[] | Uint32Array | number = 0): LongInt {
        return new LongInt(longInt).getMatchingLongInt(value);
    }

    /**
     * Carries out an in-place bitwise and (&) operation on this number and the one provided.
     * @param right - The right number.
     * @returns The new value of this & right.
     */
    public and(right: LongInt | number): this {
        const rightLongInt = this.getMatchingLongInt(right);

        for (let i = 0; i < this.data.length; i++)
            this.data[i]! &= rightLongInt.data[i]!;

        return this;
    }

    /**
     * Carries out an in-place bitwise or (|) operation on this number and the one provided.
     * @param right - The right number.
     * @returns The new value of this | right.
     */
    public or(right: LongInt | number): this {
        const rightLongInt = this.getMatchingLongInt(right);

        for (let i = 0; i < this.data.length; i++)
            this.data[i]! |= rightLongInt.data[i]!;

        return this;
    }

    /**
     * Carries out an in-place bitwise xor (^) operation on this number and the one provided.
     * @param right - The right number.
     * @returns The new value of this ^ right.
     */
    public xor(right: LongInt | number): this {
        const rightLongInt = this.getMatchingLongInt(right);

        for (let i = 0; i < this.data.length; i++)
            this.data[i]! ^= rightLongInt.data[i]!;

        return this;
    }

    /**
     * Carries out an in-place bitwise not (~) operation on this nurmbe.
     * @returns The result of ~this.
     */
    public not(): this {
        for (let i = 0; i < this.data.length; i++)
            this.data[i] = ~this.data[i]!;

        return this;
    }

    /**
     * Carries out an in-place bitwise left shift (<<) operation on this number.
     * @param shiftAmount - The number of places to shift.
     * @returns The result of this << shiftAmount.
     */
    public leftShift(shiftAmount: number): this {
        if (shiftAmount === 0)
            return this;

        if (shiftAmount > 31)
            this.shiftArrayRight(Math.floor(shiftAmount / 32));

        if (shiftAmount !== 32) {
            const singleShiftAmount = shiftAmount % 32;

            for (let i = this.data.length - 1; i >= 0; i--)
                this.data[i] = this.data[i]! << singleShiftAmount | this.data[i - 1]! >>> 32 - singleShiftAmount;
        }

        return this;
    }

    /**
     * Carries out an in-place bitwise unsigned right shift (>>>) operation on this number.
     * @param shiftAmount - The number of places to shift.
     * @returns The result of this >>> shiftAmount.
     */
    public rightShift(shiftAmount: number): this {
        if (shiftAmount === 0)
            return this;

        if (shiftAmount !== 32) {
            const singleShiftAmount = shiftAmount % 32;

            for (let i = 0; i < this.data.length; i++)
                this.data[i] = this.data[i]! >>> singleShiftAmount | this.data[i + 1]! << 32 - singleShiftAmount;
        }

        if (shiftAmount > 31)
            this.shiftArrayLeft(Math.floor(shiftAmount / 32));

        return this;
    }

    /**
     * Carries out an in-place bitwise arithmetic right shift (>>) operation on this number.
     * @param shiftAmount - The number of places to shift.
     * @returns The result of this >> shiftAmount.
     */
    public arithmeticRightShift(shiftAmount: number): this {
        if (shiftAmount === 0)
            return this;

        if (shiftAmount !== 32) {
            const singleShiftAmount = shiftAmount % 32;

            for (let i = 0; i < this.data.length; i++)
                this.data[i] = this.data[i]! >> singleShiftAmount | this.data[i + 1]! << 32 - singleShiftAmount;
        }

        if (shiftAmount > 31)
            this.shiftArrayLeft(Math.floor(shiftAmount / 32), ~0 >>> 0);

        return this;
    }

    /**
     * Determines whether or not this LongInt has equal value to another.
     * @param value - The LongInt or number to compare to.
     * @returns Whether or not they are equal.
     */
    public equals(value: LongInt | number): boolean {
        const longInt = value instanceof LongInt ? value : new LongInt([value]);
        const longestLongInt = this.data.length > longInt.data.length ? this : longInt;
        const longInt1 = LongInt.getMatchingLongInt(longestLongInt, this);
        const longInt2 = LongInt.getMatchingLongInt(longestLongInt, longInt);

        for (let i = 0; i < longestLongInt.data.length; i++) {
            if (longInt1.data[i] !== longInt2.data[i])
                return false;
        }

        return true;
    }

    /**
     * Returns a string representation of the LongInt.
     * @param type - The base of the string to print.
     * @returns The string representation.
     */
    public toString(type: StringType): string {
        let padLength = 0;

        switch (type) {
            case StringType.BINARY:
                padLength = 32;
                break;
            case StringType.DECIMAL:
                padLength = 10;
                break;
            case StringType.HEXADECIMAL:
                padLength = 8;
                break;
        }

        return [...this.data]
            .reverse()
            .map((num) => num.toString(type).padStart(padLength, "0"))
            .join(" ");
    }

    /**
     * Creates a new LongInt object with the given value, stretched or truncated to the same size as this.
     * @param longInt - The LongInt object to use as the value.
     * @returns The new LongInt.
     */
    private getMatchingLongInt(longInt: LongInt): LongInt;
    /**
     * Creates a new LongInt object using the given value, stretched or truncated to the same size as this.
     * @param values - An array of 32-bit numbers to use as the value.
     * @returns The new LongInt.
     */
    private getMatchingLongInt(values: number[] | Uint32Array): LongInt;
    /**
     * Creates a new LongInt object using the given value, stretched or truncated to the same size as this.
     * @param value - A 32-bit number to use as the value.
     * @returns The new LongInt.
     */
    private getMatchingLongInt(value?: number): LongInt;
    /**
     * Creates a LongInt with the same dimensions as this one, using the given input.
     * @param value - The value of the LongInt to create.
     * @returns The new LongInt.
     */
    private getMatchingLongInt(value: LongInt | number[] | Uint32Array | number): LongInt;
    /**
     * Creates a LongInt with the same dimensions as this one, using the given input.
     * @param value - The value of the LongInt to create.
     * @returns The new LongInt.
     */
    private getMatchingLongInt(value: LongInt | number[] | Uint32Array | number = 0): LongInt {
        let integers: number[] | Uint32Array = [];

        switch (true) {
            case value instanceof Uint32Array:
                if (value.length < this.data.length)
                    integers = [...value, ...Array<number>(this.data.length - value.length).fill(0)];
                else if (value.length > this.data.length)
                    integers = value.slice(0, this.data.length);
                else
                    integers = value;

                break;
            case value instanceof LongInt:
                if (value.data.length < this.data.length)
                    integers = [...value.data, ...Array<number>(this.data.length - value.data.length).fill(0)];
                else if (value.data.length > this.data.length)
                    integers = value.data.slice(0, this.data.length);
                else
                    integers = value.data;

                break;
            case value instanceof Array:
                if (value.length < this.data.length)
                    integers = [...value, ...Array<number>(this.data.length - value.length).fill(0)];
                else if (value.length > this.data.length)
                    integers = value.slice(0, this.data.length);
                else
                    integers = value;

                break;
            default:
                integers = [value, ...Array<number>(this.data.length - 1).fill(0)];
                break;
        }

        return new LongInt(integers);
    }

    /**
     * Shifts the 32-bit number array to the right.
     * @param count - How many places to shift the array.
     * @param fillValue - The value to fill empty spaces with.
     * @returns The new value of this.
     */
    private shiftArrayRight(count: number, fillValue: number = 0): this {
        if (count < 0)
            return this.shiftArrayLeft(-count, fillValue);

        for (let i = this.data.length - 1; i >= 0; i--)
            this.data[i] = this.data[i - count] ?? fillValue;

        return this;
    }

    /**
     * Shifts the 32-bit number array to the left.
     * @param count - How many places to shift the array.
     * @param fillValue - The value to fill empty spaces with.
     * @returns The new value of this.
     */
    private shiftArrayLeft(count: number, fillValue: number = 0): this {
        if (count < 0)
            return this.shiftArrayRight(-count, fillValue);

        for (let i = 0; i < this.data.length; i++)
            this.data[i] = this.data[i + count] ?? fillValue;

        return this;
    }
}
