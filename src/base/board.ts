import type BitBoard from "../bitBoard/bitBoard.js";
import IntBitBoard from "../bitBoard/intBitBoard.js";
import LongInt from "../bitBoard/longInt.js";
import LongIntBitBoard from "../bitBoard/longIntBitBoard.js";

export type Position = {
    y: number;
    x: number;
};

/** Defines the characters used to draw a grid. */
export const enum GridLines {
    Horizontal = "\u2500",
    Vertical = "\u2502",
    TopLeft = "\u250C",
    TopRight = "\u2510",
    BottomLeft = "\u2514",
    BottomRight = "\u2518",
    TLeft = "\u251C",
    TRight = "\u2524",
    TTop = "\u252C",
    TBottom = "\u2534",
    Cross = "\u253C",
}

/**
 * Represents a game board.
 * @template T - The type of the numeric data.
 */
export default abstract class Board<T extends LongInt | number> {
    /** Contains the data stored in a BitBoard. */
    protected readonly bitBoard: BitBoard<T>;

    /** The width of the game board. */
    protected readonly width: number;

    /** The height of the game board. */
    protected readonly height: number;

    /** A stack of moves. */
    protected readonly moves: number[] = [];

    /** How many boards there are representing player positions (most likely 2). */
    private readonly numberOfPlayerBoards: number;

    /** Number of boards in total (most likely also 2). */
    private readonly numberOfBoards: number;

    /** The board states which represent a winning state. */
    protected abstract readonly winningStates: Array<BitBoard<T>>;

    /**
     * Creates an instance of Board.
     * @param width - The width of the game board.
     * @param height - The height of the game board.
     * @param playerBoardCount - How many boards there are representing player positions (most likely 2).
     * @param extraBoardCount - Number of extra boards (most likely 0).
     */
    protected constructor(width: number, height: number, playerBoardCount: number = 2, extraBoardCount: number = 0) {
        this.width = width;
        this.height = height;
        this.numberOfPlayerBoards = playerBoardCount;
        this.numberOfBoards = this.numberOfPlayerBoards + extraBoardCount;
        const totalBits = this.width * this.height * this.numberOfBoards;

        this.bitBoard = (totalBits > 32
            ? new LongIntBitBoard(Math.ceil(totalBits / 32))
            : new IntBitBoard()) as BitBoard<T>;
    }

    /**
     * Calculates whether or not the board is full.
     * @returns Whether or not the board is full.
     */
    public get isFull(): boolean {
        let isFull = (this.bitBoard instanceof LongIntBitBoard
            ? new LongIntBitBoard(Math.ceil(this.width * this.height / 32))
            : new IntBitBoard()) as BitBoard<T>;

        for (let i = 0; i < this.numberOfPlayerBoards; i++)
            isFull = isFull.or(this.getPlayerBoard(i));
        const fullValue = (this.bitBoard instanceof LongIntBitBoard
            ? new LongInt([
                ...Array<number>(Math.ceil(this.width * this.height / 32) - 1).fill(~0 >>> 0),
                2 ** (this.width * this.height - (Math.ceil(this.width * this.height / 32) - 1) * 32) - 1,
            ])
            : 2 ** (this.width * this.height) - 1) as T;

        return isFull.equals(fullValue);
    }

    /**
     * Calculates whether or not the board is empty.
     * @returns Whether or not the board is empty.
     */
    public get isEmpty(): boolean {
        let isEmpty = (this.bitBoard instanceof LongIntBitBoard
            ? new LongIntBitBoard(Math.ceil(this.width * this.height / 32))
            : new IntBitBoard()) as BitBoard<T>;

        for (let i = 0; i < this.numberOfPlayerBoards; i++)
            isEmpty = isEmpty.or(this.getPlayerBoard(i));

        return isEmpty.equals(0);
    }

    /**
     * Calculates who the winner is.
     * @returns `false` if the game is not over, the player ID if there is a winner, and `null` if there is a draw.
     */
    public get winner(): 0 | 1 | false | null {
        const playerOneBoard = this.getPlayerBoard(0);
        const playerTwoBoard = this.getPlayerBoard(1);

        for (const state of this.winningStates) {
            if (playerOneBoard.and(state).equals(state))
                return 0;

            if (playerTwoBoard.and(state).equals(state))
                return 1;
        }

        if (this.isFull)
            return null;

        return false;
    }

    /**
     * Calculates which cells are empty.
     * @returns The empty cells on the board.
     */
    public get emptyCells(): Position[] {
        const emptyCells: Position[] = [];

        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                if (this.cellOccupier({ x, y }) === null)
                    emptyCells.push({ x, y });
            }
        }

        return emptyCells;
    }

    /** Calculates the heuristic score for a given board state. */
    public abstract get heuristic(): number;

    /**
     * Makes a move on the board.
     * @param move - The position of the move.
     * @param playerId - The player who's making the move.
     */
    public makeMove(move: Position, playerId: number): void {
        const bit = this.getBitIndex(move, playerId);

        this.moves.push(bit);
        this.bitBoard.setBit(bit);
    }

    /**
     * Reverses the last move.
     * @throws {Error} - If there is no move to undo.
     */
    public undoLastMove(): void {
        const lastMove = this.moves.pop();

        if (lastMove === undefined)
            throw new Error("No move to undo.");

        this.bitBoard.clearBit(lastMove);
    }

    /**
     * Checks if a move is valid.
     * @param move - The position of the move.
     * @returns Whether or not it's valid.
     */
    public moveIsValid(move: Position): boolean {
        return this.isValidPosition(move) && this.cellOccupier(move) === null;
    }

    /**
     * Checks which player is occupying a given cell.
     * @param cell - The cell to check.
     * @returns If the cell is empty, the output is null, otherwise the output is the player's ID.
     */
    public cellOccupier(cell: Position): number | null {
        for (let i = 0; i < this.numberOfPlayerBoards; i++) {
            if (this.bitBoard.getBit(this.getBitIndex(cell, i)) === 1)
                return i;
        }

        return null;
    }

    /**
     * Creates a string representation of the board.
     * @param wrap - Whether or not to provide a border for the board.
     * @param labelX - Whether or not to label x.
     * @param labelY - Whether or not to label y.
     * @param symbols - The symbols to use as board pieces.
     * @param colour - Whether or not to colour the pieces.
     * @returns The string representation.
     * @throws {Error} - If the symbols are not the same length.
     */
    public toString(
        wrap: boolean = true,
        labelX: boolean = true,
        labelY: boolean = true,
        symbols: string[] = ["X", "O"],
        colour: boolean = true,
    ): string {
        if (symbols.length !== this.numberOfPlayerBoards)
            throw new Error("Too many symbols.");

        const symbolLength = symbols[0]!.length;

        if (symbols.some((s) => s.length !== symbolLength))
            throw new Error("Symbols must be the same length.");

        const matchCellSpace = new RegExp(`.{${symbolLength + 2}}`, "gu");
        const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
        const xLabels = labelX
            ? `${alphabet.slice(0, this.width)
                .split("")
                .map((letter) => ` ${letter.padStart(symbolLength)} `)
                .join("")
                .match(matchCellSpace)!
                .join(" ")
                .padStart(4 * this.width - 1 + Number(wrap) + Number(labelY))
            }\n`
            : "";
        const topBorder = wrap
            ? `${labelY ? " " : ""}${GridLines.TopLeft}${GridLines.Horizontal
                .repeat(this.width * (symbolLength + 2))
                .match(matchCellSpace)!
                .join(GridLines.TTop)}${GridLines.TopRight}\n`
            : "";
        const bottomBorder = wrap
            ? `${labelY ? " " : ""}${GridLines.BottomLeft}${GridLines.Horizontal
                .repeat(this.width * (symbolLength + 2))
                .match(matchCellSpace)!
                .join(GridLines.TBottom)}${GridLines.BottomRight}`
            : "";
        const rowSeparator = `${labelY ? " " : ""}${wrap ? GridLines.TLeft : ""}${GridLines.Horizontal
            .repeat(this.width * (symbolLength + 2))
            .match(matchCellSpace)!
            .join(GridLines.Cross)}${wrap ? GridLines.TRight : ""}\n`;
        const rows: string[] = [];

        for (let y = 0; y < this.height; y++) {
            const yLabel = labelY ? `${y + 1}` : "";
            const leftBorder = wrap ? GridLines.Vertical : "";
            const rightBorder = wrap ? GridLines.Vertical : "";
            let row = `${yLabel}${leftBorder}`;

            for (let x = 0; x < this.width; x++) {
                const cell = { x, y };
                const bar = x === this.width - 1 ? "" : GridLines.Vertical;
                const cellOccupier = this.cellOccupier(cell);

                if (cellOccupier === null) {
                    row += ` ${" ".repeat(symbolLength)} ${bar}`;
                } else {
                    row += ` ${colour ? `\x1b[${[91, 93][cellOccupier]!}m` : ""}` +
                        `${symbols[cellOccupier]}` +
                        `${colour ? "\x1b[0m" : ""} ${bar}`;
                }
            }
            rows.push(`${row}${rightBorder}\n`);
        }

        return `${xLabels}${topBorder}${rows.join(rowSeparator)}${bottomBorder}`;
    }

    /**
     * Determines if a given player has a line of pieces on the board.
     * @param playerId - The ID of the player to check.
     * @param length - The number of pieces needed.
     * @param maxGaps - The number of gaps allowed for a line to be valid. Defaults to 0.
     * @returns How many lines exist.
     */
    public hasLine(playerId: number, length: number, maxGaps: number = 0): number {
        if (length > Math.max(this.width, this.height))
            return 0;

        const DIRECTIONS: [Position, Position, Position, Position] = [
            { x: 1, y: 0 },
            { x: 0, y: 1 },
            { x: 1, y: 1 },
            { x: 1, y: -1 },
        ];
        let lineCount = 0;
        let gaps: [number, number, number, number] = [0, 0, 0, 0];
        let lengths: [number, number, number, number] = [0, 0, 0, 0];
        const checkCell = (x: number, y: number, direction: 0 | 1 | 2 | 3): void => {
            const cell = { x, y } as Position;

            if (this.isValidPosition(cell)) {
                const cellOccupier = this.cellOccupier(cell);

                if (cellOccupier === null)
                    gaps[direction]++;
                else if (cellOccupier === playerId)
                    lengths[direction]++;
            }
        };

        for (let x = 0; x < this.width; x++) {
            for (let y = 0; y < this.height; y++) {
                gaps = [0, 0, 0, 0];
                lengths = [0, 0, 0, 0];
                for (let i = 0; i < length; i++) {
                    for (let j = 0 as 0 | 1 | 2 | 3; j < 4; j++) {
                        if (gaps[j] > maxGaps)
                            continue;

                        checkCell(x + i * DIRECTIONS[j].x, y + i * DIRECTIONS[j].y, j);

                        if (lengths[j] === length)
                            lineCount++;
                    }
                }
            }
        }

        return lineCount;
    }

    /**
     * Gets a bit index from its coordinates and player ID.
     * @param move - The coordinates.
     * @param playerId - The player ID to use.
     * @returns The bit index of the move.
     */
    protected getBitIndex(move: Position, playerId: number): number {
        const moveIndex = this.getIndex(move);
        const bitBoardMoveIndex = moveIndex + this.width * this.height * playerId;

        return bitBoardMoveIndex;
    }

    /**
     * A BitBoard containing only the player's bits.
     * @param playerId - The player's ID to get the board for.
     * @returns The player's bits.
     */
    protected getPlayerBoard(playerId: number): BitBoard<T> {
        const totalBits = (this.bitBoard instanceof LongIntBitBoard ? this.bitBoard.data.wordCount : 1) * 32;
        const boardSize = this.width * this.height;

        return this.bitBoard.leftShift(totalBits - boardSize * (playerId + 1)).rightShift(totalBits - boardSize);
    }

    /**
     * Gets a bit index from its coordinates.
     * @param move - The coordinates.
     * @returns The bit index.
     */
    private getIndex(move: Position): number {
        return this.width * move.y + move.x;
    }

    /**
     * Checks if a move is valid for the given board.
     * Does not check if that cell is already occupied.
     * @param position - The position to check.
     * @returns Whether or not that cell exists on the board.
     */
    private isValidPosition(position: Position): boolean {
        return position.x >= 0 && position.x < this.width && position.y >= 0 && position.y < this.height;
    }
}
