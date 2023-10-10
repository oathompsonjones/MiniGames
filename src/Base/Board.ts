import type BitBoard from "../BitBoard/BitBoard.js";
import IntBitBoard from "../BitBoard/IntBitBoard.js";
import LongInt from "../BitBoard/LongInt.js";
import LongIntBitBoard from "../BitBoard/LongIntBitBoard.js";

export interface Position {
    y: number;
    x: number;
}

/**
 * Defines the characters used to draw a grid.
 *
 * @enum {number}
 */
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
    Cross = "\u253C"
}

/**
 * Represent a game board.
 *
 * @abstract
 * @class Board
 * @typedef {Board}
 * @template BitBoardType extends BitBoard
 */
export default abstract class Board<BitBoardType extends BitBoard> {
    /**
     * Contains the data stored in a BitBoard.
     *
     * @protected
     * @readonly
     * @type {BitBoardType}
     */
    protected readonly bitBoard: BitBoardType;

    /**
     * The width of the board.
     *
     * @protected
     * @readonly
     * @type {number}
     */
    protected readonly boardWidth: number;

    /**
     * The height of the board.
     *
     * @protected
     * @readonly
     * @type {number}
     */
    protected readonly boardHeight: number;

    /**
     * A stack of moves.
     *
     * @protected
     * @readonly
     * @type {number[]}
     */
    protected readonly moves: number[] = [];

    /**
     * How many boards there are representing player positions (most likely 2).
     *
     * @private
     * @readonly
     * @type {number}
     */
    private readonly numberOfPlayerBoards: number;

    /**
     * Number of boards in total (most likely also 2).
     *
     * @private
     * @readonly
     * @type {number}
     */
    private readonly numberOfBoards: number;

    /**
     * The board states which represent a winning state.
     *
     * @protected
     * @abstract
     * @readonly
     * @type {BitBoardType[]}
     */
    protected abstract readonly winningStates: BitBoardType[];

    /**
     * Creates an instance of Board.
     *
     * @constructor
     * @protected
     * @param {number} width The width of the board.
     * @param {number} height The height of the board.
     * @param {number} playerBoardCount How many boards there are representing player positions (most likely 2).
     * @param {number} [extraBoardCount=0] Number of extra boards (most likely 0).
     */
    protected constructor(width: number, height: number, playerBoardCount: number = 2, extraBoardCount: number = 0) {
        this.boardWidth = width;
        this.boardHeight = height;
        this.numberOfPlayerBoards = playerBoardCount;
        this.numberOfBoards = this.numberOfPlayerBoards + extraBoardCount;
        const totalBits = this.boardWidth * this.boardHeight * this.numberOfBoards;
        this.bitBoard = (totalBits > 32 ? new LongIntBitBoard(Math.ceil(totalBits / 32)) : new IntBitBoard()) as BitBoardType;
    }

    /**
     * Calculates whether or not the board is full.
     *
     * @public
     * @readonly
     * @type {boolean}
     */
    public get isFull(): boolean {
        let isFull = (this.bitBoard instanceof LongIntBitBoard
            ? new LongIntBitBoard(Math.ceil(this.boardWidth * this.boardHeight / 32))
            : new IntBitBoard()) as BitBoardType;
        for (let i = 0; i < this.numberOfPlayerBoards; i++)
            isFull = isFull.or(this.getPlayerBoard(i));
        const fullValue = this.bitBoard instanceof LongIntBitBoard
            ? new LongInt([
                ...Array<number>(Math.ceil(this.boardWidth * this.boardHeight / 32) - 1).fill(~0 >>> 0),
                2 ** (this.boardWidth * this.boardHeight - (Math.ceil(this.boardWidth * this.boardHeight / 32) - 1) * 32) - 1
            ])
            : 2 ** (this.boardWidth * this.boardHeight) - 1;
        return isFull.equals(fullValue);
    }

    /**
     * Calculates whether or not the board is empty.
     *
     * @public
     * @readonly
     * @type {boolean}
     */
    public get isEmpty(): boolean {
        let isEmpty = (this.bitBoard instanceof LongIntBitBoard
            ? new LongIntBitBoard(Math.ceil(this.boardWidth * this.boardHeight / 32))
            : new IntBitBoard()) as BitBoardType;
        for (let i = 0; i < this.numberOfPlayerBoards; i++)
            isEmpty = isEmpty.or(this.getPlayerBoard(i));
        return isEmpty.equals(0);
    }

    /**
     * Calculates who the winner is.
     * If the game is not over, the output is false.
     * If there is a winner, the output is their ID.
     * If there is a draw, the output is null.
     *
     * @public
     * @readonly
     * @type {(0 | 1 | false | null)}
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
     *
     * @public
     * @readonly
     * @type {Position[]}
     */
    public get emptyCells(): Position[] {
        const emptyCells: Position[] = [];
        for (let y = 0; y < this.boardHeight; y++) {
            for (let x = 0; x < this.boardWidth; x++) {
                const cell = { x, y } as Position;
                if (this.cellOccupier(cell) === null)
                    emptyCells.push(cell);
            }
        }
        return emptyCells;
    }

    /**
     * Calculates the heuristic score for a given board state.
     *
     * @public
     * @abstract
     * @readonly
     * @type {number}
     */
    public abstract get heuristic(): number;

    /**
     * Makes a move on the board.
     *
     * @public
     * @param {Position} move The position of the move.
     * @param {number} playerId The player who's making the move.
     */
    public makeMove(move: Position, playerId: number): void {
        const bit = this.getBitIndex(move, playerId);
        this.moves.push(bit);
        this.bitBoard.setBit(bit);
    }

    /**
     * Reverses the last move.
     *
     * @public
     */
    public undoLastMove(): void {
        const lastMove = this.moves.pop();
        if (lastMove === undefined)
            throw new Error("No move to undo.");
        this.bitBoard.clearBit(lastMove);
    }

    /**
     * Checks if a move is valid.
     *
     * @public
     * @param {Position} move The move.
     * @returns {boolean} Whether or not it's valid.
     */
    public moveIsValid(move: Position): boolean {
        return this.isValidPosition(move) && this.cellOccupier(move) === null;
    }

    /**
     * Checks which player is occupying a given cell.
     *
     * @public
     * @param {Position} cell The cell to check.
     * @returns {(number | null)} If the cell is empty, the output is null, otherwise the output is the player's ID.
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
     *
     * @public
     * @param {boolean} [wrap=true] Whether or not to provide a border for the board.
     * @param {boolean} [labelX=true] Whether or not to label x.
     * @param {boolean} [labelY=true] Whether or not to label y.
     * @param {string[]} [symbols=["x", "Y"]] The symbols to use as board pieces.
     * @returns {string} The string representation.
     */
    public toString(wrap: boolean = true, labelX: boolean = true, labelY: boolean = true, symbols: string[] = ["X", "O"]): string {
        const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
        const xLabels = labelX
            ? `${alphabet.slice(0, this.boardWidth)
                .split("")
                .map((letter) => ` ${letter} `)
                .join("")
                .match(/.{3}/gu)!
                .join(" ")
                .padStart(4 * this.boardWidth - 1 + Number(wrap) + Number(labelY))
            }\n`
            : "";
        const topBorder = wrap
            ? `${labelY ? " " : ""}${GridLines.TopLeft}${GridLines.Horizontal
                .repeat(this.boardWidth * 3)
                .match(/.{3}/gu)!
                .join(GridLines.TTop)}${GridLines.TopRight}\n`
            : "";
        const bottomBorder = wrap
            ? `${labelY ? " " : ""}${GridLines.BottomLeft}${GridLines.Horizontal
                .repeat(this.boardWidth * 3)
                .match(/.{3}/gu)!
                .join(GridLines.TBottom)}${GridLines.BottomRight}`
            : "";
        const rowSeparator = `${labelY ? " " : ""}${wrap ? GridLines.TLeft : ""}${GridLines.Horizontal
            .repeat(this.boardWidth * 3)
            .match(/.{3}/gu)!
            .join(GridLines.Cross)}${wrap ? GridLines.TRight : ""}\n`;
        const rows = [];
        for (let y = 0; y < this.boardHeight; y++) {
            const yLabel = labelY ? `${y + 1}` : "";
            const leftBorder = wrap ? GridLines.Vertical : "";
            const rightBorder = wrap ? GridLines.Vertical : "";
            let row = "";
            for (let x = 0; x < this.boardWidth; x++) {
                const cell = { x, y };
                const cellOccupier = this.cellOccupier(cell);
                if (cellOccupier === null)
                    row += "   ";
                else
                    row += ` ${symbols[cellOccupier]!} `;
            }
            rows.push(`${yLabel}${leftBorder}${row
                .match(/.{3}/gu)!
                .join(GridLines.Vertical)}${rightBorder}\n`);
        }
        return `${xLabels}${topBorder}${rows.join(rowSeparator)}${bottomBorder}`;
    }

    /**
     * Determines if a given player has a line of pieces on the board.
     *
     * @public
     * @param {number} playerId The ID of the player.
     * @param {number} length The number of pieces needed.
     * @param {number} [maxGaps=0] The number of gaps allowed for a line to be valid. Defaults to 0.
     * @returns {number} How many lines exist.
     */
    public hasLine(playerId: number, length: number, maxGaps: number = 0): number {
        if (length > Math.max(this.boardWidth, this.boardHeight))
            return 0;
        const DIRECTIONS: [Position, Position, Position, Position] = [{ x: 1, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }, { x: 1, y: -1 }];
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
        for (let x = 0; x < this.boardWidth; x++) {
            for (let y = 0; y < this.boardHeight; y++) {
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
     *
     * @protected
     * @param {Position} move The coordinates.
     * @param {number} playerId The player ID.
     * @returns {number} The bit index.
     */
    protected getBitIndex(move: Position, playerId: number): number {
        const moveIndex = this.getIndex(move);
        const bitBoardMoveIndex = moveIndex + this.boardWidth * this.boardHeight * playerId;
        return bitBoardMoveIndex;
    }

    /**
     * A BitBoard containing only the player's bits.
     *
     * @protected
     * @param {number} playerId The player's ID.
     * @returns {BitBoardType} The player's bits.
     */
    protected getPlayerBoard(playerId: number): BitBoardType {
        const totalBits = (this.bitBoard instanceof LongIntBitBoard ? this.bitBoard.data.wordCount : 1) * 32;
        const boardSize = this.boardWidth * this.boardHeight;
        return this.bitBoard.leftShift(totalBits - boardSize * (playerId + 1)).rightShift(totalBits - boardSize);
    }

    /**
     * Gets a bit index from its coordinates.
     *
     * @private
     * @param {Position} move The coordinates.
     * @returns {number} The bit index.
     */
    private getIndex(move: Position): number {
        return this.boardWidth * move.y + move.x;
    }

    /**
     * Checks if a move is valid for the given board.
     * Does not check if that cell is already occupied.
     *
     * @private
     * @param {Position} position The position to check.
     * @returns {boolean} Whether or not that cell exists on the board.
     */
    private isValidPosition(position: Position): boolean {
        return position.x >= 0 && position.x < this.boardWidth && position.y >= 0 && position.y < this.boardHeight;
    }
}
