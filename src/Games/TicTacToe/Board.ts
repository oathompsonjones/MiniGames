import type { Position, Range } from "../../Types";
import { Board as Base } from "../../Base";
import { GridLines } from "../../Utils";
import { IntBitBoard } from "../../BitBoard";
import type { MoveDimensions } from "../../Utils";

export default class Board extends Base<3, 3, IntBitBoard, MoveDimensions.TwoDimensional> {
    protected winningStates: IntBitBoard[] = [
        new IntBitBoard(0b000000111),
        new IntBitBoard(0b000111000),
        new IntBitBoard(0b111000000),
        new IntBitBoard(0b001001001),
        new IntBitBoard(0b010010010),
        new IntBitBoard(0b100100100),
        new IntBitBoard(0b100010001),
        new IntBitBoard(0b001010100)
    ];

    public constructor() {
        super(3, 3);
    }

    public get heuristic(): number {
        const { winner } = this;
        if (winner === 0)
            return 10;
        if (winner === 1)
            return -10;
        return 0;
    }

    public moveIsValid(move: Position<MoveDimensions.TwoDimensional, Range<3>, Range<3>>): boolean {
        const isWithinBoard = move.x >= 0 && move.x <= 2 && move.y >= 0 && move.y <= 2;
        const notOccupied = this.cellOccupier(move) === null;
        return isWithinBoard && notOccupied;
    }

    public override toString(): string {
        return `  A B C\n${super.toString().trim()
            .split("\n")
            .map((line, i) => `${i + 1} ${line
                .replace(/\s/gu, GridLines.Vertical)
                .replace(/0/gu, " ")
                .replace(/1/gu, "X")
                .replace(/2/gu, "O")
            }`)
            .join(`\n${GridLines.Horizontal
                .repeat(3)
                .split("")
                .join(GridLines.Cross)
                .padStart(7)}\n`)
            .trim()}`;
    }

    protected getPlayerBoard(playerId: number): IntBitBoard {
        return this.data.leftShift(32 - 9 * (playerId + 1)).rightShift(32 - 9);
    }
}
