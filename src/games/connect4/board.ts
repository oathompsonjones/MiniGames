import Base from "../../base/board.js";
import LongInt from "../../bitBoard/longInt.js";
import LongIntBitBoard from "../../bitBoard/longIntBitBoard.js";
import type { Position } from "../../base/board.js";

/** Represents a Connect 4 board. */
export default class Board extends Base<LongInt> {
    protected winningStates: LongIntBitBoard[] = [];

    /**
     * Tracks the next available row index per column (row 5 = bottom, row 0 = top).
     * A value of -1 means the column is full.
     * Maintained incrementally so makeMove and emptyCells are O(1).
     */
    private readonly heights: number[] = [5, 5, 5, 5, 5, 5, 5];

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
     * Favors blocking opponent's 3s over making own 3s.
     * @returns The heuristic score.
     */
    // eslint-disable-next-line max-statements
    public get heuristic(): number {
        const { winner } = this;

        if (winner === 0)
            return 10000 - this.moves.length;

        if (winner === 1)
            return -(10000 - this.moves.length);

        let p0Score = 0;
        let p1Score = 0;

        // Scoring: defensive moves (blocking) weighted 1.5x higher than offensive moves
        const offensiveScores = [0, 1, 10, 100];
        const defensiveScores = [0, 1.5, 15, 150];

        // Horizontal →
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width - 3; x++) {
                const window = [
                    this.cellOccupier({ x, y } as Position),
                    this.cellOccupier({ x: x + 1, y } as Position),
                    this.cellOccupier({ x: x + 2, y } as Position),
                    this.cellOccupier({ x: x + 3, y } as Position),
                ];

                const p0Count = window.filter((occupier) => occupier === 0).length;
                const p1Count = window.filter((occupier) => occupier === 1).length;

                if (p0Count > 0 && p1Count === 0)
                    p0Score += defensiveScores[p0Count]!;
                else if (p1Count > 0 && p0Count === 0)
                    p1Score += offensiveScores[p1Count]!;
            }
        }

        // Vertical ↓
        for (let x = 0; x < this.width; x++) {
            for (let y = 0; y < this.height - 3; y++) {
                const window = [
                    this.cellOccupier({ x, y } as Position),
                    this.cellOccupier({ x, y: y + 1 } as Position),
                    this.cellOccupier({ x, y: y + 2 } as Position),
                    this.cellOccupier({ x, y: y + 3 } as Position),
                ];

                const p0Count = window.filter((occupier) => occupier === 0).length;
                const p1Count = window.filter((occupier) => occupier === 1).length;

                if (p0Count > 0 && p1Count === 0)
                    p0Score += defensiveScores[p0Count]!;
                else if (p1Count > 0 && p0Count === 0)
                    p1Score += offensiveScores[p1Count]!;
            }
        }

        // Diagonal ↘
        for (let x = 0; x < this.width - 3; x++) {
            for (let y = 0; y < this.height - 3; y++) {
                const window = [
                    this.cellOccupier({ x, y } as Position),
                    this.cellOccupier({ x: x + 1, y: y + 1 } as Position),
                    this.cellOccupier({ x: x + 2, y: y + 2 } as Position),
                    this.cellOccupier({ x: x + 3, y: y + 3 } as Position),
                ];

                const p0Count = window.filter((occupier) => occupier === 0).length;
                const p1Count = window.filter((occupier) => occupier === 1).length;

                if (p0Count > 0 && p1Count === 0)
                    p0Score += defensiveScores[p0Count]!;
                else if (p1Count > 0 && p0Count === 0)
                    p1Score += offensiveScores[p1Count]!;
            }
        }

        // Diagonal ↗
        for (let x = 0; x < this.width - 3; x++) {
            for (let y = 3; y < this.height; y++) {
                const window = [
                    this.cellOccupier({ x, y } as Position),
                    this.cellOccupier({ x: x + 1, y: y - 1 } as Position),
                    this.cellOccupier({ x: x + 2, y: y - 2 } as Position),
                    this.cellOccupier({ x: x + 3, y: y - 3 } as Position),
                ];

                const p0Count = window.filter((occupier) => occupier === 0).length;
                const p1Count = window.filter((occupier) => occupier === 1).length;

                if (p0Count > 0 && p1Count === 0)
                    p0Score += defensiveScores[p0Count]!;
                else if (p1Count > 0 && p0Count === 0)
                    p1Score += offensiveScores[p1Count]!;
            }
        }

        return p1Score - p0Score;
    }

    /**
     * Generates a list of available column moves ordered centre-first so that
     * alpha-beta pruning encounters the strongest moves earliest.
     * Uses the incremental heights array — O(width), no bitboard reads.
     * @returns The list of empty cells.
     */
    public override get emptyCells(): Position[] {
        const emptyCells: Position[] = [];

        for (const x of [3, 2, 4, 1, 5, 0, 6]) {
            if (this.heights[x]! >= 0)
                emptyCells.push({ x, y: 0 });
        }

        return emptyCells;
    }

    /**
     * Makes a move on the board.
     * Uses the heights array for O(1) row resolution instead of scanning the column.
     * @param move - The move to make.
     * @param playerId - The player making the move.
     */
    public override makeMove(move: Position, playerId: number): void {
        move.y = this.heights[move.x]!;
        this.heights[move.x]!--;
        super.makeMove(move, playerId);
    }

    /**
     * Reverses the last move and restores the column height.
     */
    public override undoLastMove(): void {
        // X-coordinate is recoverable from the bit index: bit % width = x.
        const { x } = (this.moves[this.moves.length - 1]!);

        super.undoLastMove();
        this.heights[x]!++;
    }
}
