import Base from "../../base/board.js";
import LongInt from "../../bitBoard/longInt.js";
import LongIntBitBoard from "../../bitBoard/longIntBitBoard.js";
import type { Position } from "../../base/board.js";

/** Represents a Connect 4 board. */
export default class Board extends Base<LongInt> {
    protected winningStates: LongIntBitBoard[] = [];

    private readonly FULL_BOARD = new LongInt([0b1111_1111111_1111111_1111111_1111111, 0b1111111_111]);

    private readonly HORIZONTAL = new LongInt([0b0000_0000000_0000000_0000000_0001111, 0b0000000_000]);

    private readonly VERTICAL = new LongInt([0b0000_0000001_0000001_0000001_0000001, 0b0000000_000]);

    private readonly LEADING_DIAGONAL = new LongInt([0b0000_0001000_0000100_0000010_0000001, 0b0000000_000]);

    private readonly NON_LEADING_DIAGONAL = new LongInt([0b0000_0000001_0000010_0000100_0001000, 0b0000000_000]);

    /** Creates an instance of Board. */
    public constructor() {
        super(7, 6);
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 6; j++) {
                this.winningStates.push(new LongIntBitBoard(LongInt
                    .leftShift(this.HORIZONTAL, i + 7 * j)
                    .and(this.FULL_BOARD)));
            }
        }
        for (let i = 0; i < 7; i++) {
            for (let j = 0; j < 3; j++) {
                this.winningStates.push(new LongIntBitBoard(LongInt
                    .leftShift(this.VERTICAL, i + 7 * j)
                    .and(this.FULL_BOARD)));
            }
        }
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 3; j++) {
                this.winningStates.push(new LongIntBitBoard(LongInt
                    .leftShift(this.LEADING_DIAGONAL, i + 7 * j)
                    .and(this.FULL_BOARD)));
            }
        }
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 3; j++) {
                this.winningStates.push(new LongIntBitBoard(LongInt
                    .leftShift(this.NON_LEADING_DIAGONAL, i + 7 * j)
                    .and(this.FULL_BOARD)));
            }
        }
    }

    /**
     * Calculates the heuristic score for the current board state.
     * @returns The heuristic score.
     */
    public get heuristic(): number {
        const { winner } = this;

        if (winner === 0)
            return 1000;

        if (winner === 1)
            return -1000;

        const p0LineOfThreeNoGaps = this.hasLine(0, 3);
        const p1LineOfThreeNoGaps = this.hasLine(1, 3);
        const p0LineOfThreeOneGap = this.hasLine(0, 3, 1);
        const p1LineOfThreeOneGap = this.hasLine(1, 3, 1);
        const p0LineOfThreeTwoGaps = this.hasLine(0, 3, 2);
        const p1LineOfThreeTwoGaps = this.hasLine(1, 3, 2);
        const p0LineOfTwoNoGaps = this.hasLine(0, 2);
        const p1LineOfTwoNoGaps = this.hasLine(1, 2);
        const p0LineOfTwoOneGap = this.hasLine(0, 2, 1);
        const p1LineOfTwoOneGap = this.hasLine(1, 2, 1);
        const p0LineOfTwoTwoGaps = this.hasLine(0, 2, 2);
        const p1LineOfTwoTwoGaps = this.hasLine(1, 2, 2);
        const p0LineOfThreeScore = 3 * p0LineOfThreeNoGaps + 2 * p0LineOfThreeOneGap + p0LineOfThreeTwoGaps;
        const p1LineOfThreeScore = 3 * p1LineOfThreeNoGaps + 2 * p1LineOfThreeOneGap + p1LineOfThreeTwoGaps;
        const p0LineOfTwoScore = 3 * p0LineOfTwoNoGaps + 2 * p0LineOfTwoOneGap + p0LineOfTwoTwoGaps;
        const p1LineOfTwoScore = 3 * p1LineOfTwoNoGaps + 2 * p1LineOfTwoOneGap + p1LineOfTwoTwoGaps;
        const p0Score = 10 * p0LineOfThreeScore + p0LineOfTwoScore;
        const p1Score = 10 * p1LineOfThreeScore + p1LineOfTwoScore;

        return p0Score - p1Score;
    }

    /**
     * Generates a list of empty cells.
     * @returns The list of empty cells.
     */
    public override get emptyCells(): Position[] {
        const emptyCells: Position[] = [];

        for (let x = 0; x < this.width; x++) {
            const cell: Position = { x, y: 0 };

            if (this.cellOccupier(cell) === null)
                emptyCells.push(cell);
        }

        return emptyCells;
    }

    /**
     * Makes a move on the board.
     * @param move - The move to make.
     * @param playerId - The player making the move.
     */
    public override makeMove(move: Position, playerId: number): void {
        const updatedMove = move;

        for (let i = 5; i >= 0; i--) {
            if (this.cellOccupier({ x: move.x, y: i }) === null) {
                move.y = i;
                break;
            }
        }
        super.makeMove(updatedMove, playerId);
    }
}
