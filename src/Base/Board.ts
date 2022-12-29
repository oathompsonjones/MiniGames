import { IntBitBoard, LongInt, LongIntBitBoard } from "../BitBoard";
import type { MoveDimensions, Position, Range } from "../Utils";
import type { BitBoard } from "../BitBoard";

/**
 * Represent a game board.
 *
 * @abstract
 * @class Board
 * @typedef {Board}
 * @template Width extends number
 * @template Height extends number
 * @template BitBoardType extends BitBoard
 * @template MoveType extends MoveDimensions
 */
export abstract class Board<Width extends number, Height extends number, BitBoardType extends BitBoard, MoveType extends MoveDimensions> {
    /**
     * Contains the data stored in a BitBoard.
     *
     * @protected
     * @readonly
     * @type {BitBoardType}
     */
    protected readonly data: BitBoardType;

    /**
     * The width of the board.
     *
     * @protected
     * @readonly
     * @type {Width}
     */
    protected readonly boardWidth: Width;

    /**
     * The height of the board.
     *
     * @protected
     * @readonly
     * @type {Height}
     */
    protected readonly boardHeight: Height;

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
     * A stack of moves.
     *
     * @private
     * @readonly
     * @type {number[]}
     */
    private readonly moves: number[] = [];

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
     * @param {Width} width The width of the board.
     * @param {Height} height The height of the board.
     * @param {number} playerBoardCount How many boards there are representing player positions (most likely 2).
     * @param {number} [extraBoardCount=0] Number of extra boards (most likely 0).
     */
    protected constructor(width: Width, height: Height, playerBoardCount: number = 2, extraBoardCount: number = 0) {
        this.boardWidth = width;
        this.boardHeight = height;
        this.numberOfPlayerBoards = playerBoardCount;
        this.numberOfBoards = this.numberOfPlayerBoards + extraBoardCount;
        const totalBits = this.boardWidth * this.boardHeight * this.numberOfBoards;
        this.data = (totalBits > 32 ? new LongIntBitBoard(Math.ceil(totalBits / 32)) : new IntBitBoard()) as BitBoardType;
    }

    /**
     * Calculates whether or not the board is full.
     *
     * @public
     * @readonly
     * @type {boolean}
     */
    public get isFull(): boolean {
        let isFull = (this.data instanceof LongIntBitBoard
            ? new LongIntBitBoard(Math.ceil(this.boardWidth * this.boardHeight / 32))
            : new IntBitBoard()) as BitBoardType;
        for (let i = 0; i < this.numberOfPlayerBoards; i++)
            isFull = isFull.or(this.getPlayerBoard(i)) as BitBoardType;
        if (isFull instanceof LongIntBitBoard) {
            const arr = Array<number>(Math.ceil(this.boardWidth * this.boardHeight / 32)).fill(~0 >>> 0);
            arr[arr.length - 1] = 2 ** (this.boardWidth * this.boardHeight - (arr.length - 1) * 32) - 1;
            return isFull.equals(new LongInt(arr));
        }
        return isFull.equals(2 ** this.boardWidth * this.boardHeight - 1);
    }

    /**
     * Calculates whether or not the board is empty.
     *
     * @public
     * @readonly
     * @type {boolean}
     */
    public get isEmpty(): boolean {
        let isEmpty = (this.data instanceof LongIntBitBoard
            ? new LongIntBitBoard(Math.ceil(this.boardWidth * this.boardHeight / 32))
            : new IntBitBoard()) as BitBoardType;
        for (let i = 0; i < this.numberOfPlayerBoards; i++)
            isEmpty = isEmpty.or(this.getPlayerBoard(i)) as BitBoardType;
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
     * @type {(number | false | null)}
     */
    public get winner(): number | false | null {
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
     * @type {Array<Position<MoveType, Range<Width>, Range<Height>>>}
     */
    public get emptyCells(): Array<Position<MoveType, Range<Width>, Range<Height>>> {
        const emptyCells: Array<Position<MoveType, Range<Width>, Range<Height>>> = [];
        for (let y = 0; y < this.boardHeight; y++) {
            for (let x = 0; x < this.boardWidth; x++) {
                const cell = { x, y } as Position<MoveType, Range<Width>, Range<Height>>;
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
     * @param {Position<MoveType, Range<Width>, Range<Height>>} move The position of the move.
     * @param {number} playerId The player who's making the move.
     */
    public makeMove(move: Position<MoveType, Range<Width>, Range<Height>>, playerId: number): void {
        const bit = this.getBitIndex(move, playerId);
        this.moves.push(bit);
        this.data.setBit(bit);
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
        this.data.clearBit(lastMove);
    }

    /**
     * Checks which player is occupying a given cell.
     *
     * @public
     * @param {Position<MoveType, Range<Width>, Range<Height>>} cell The cell to check.
     * @returns {(number | null)} If the cell is empty, the output is null, otherwise the output is the player's ID.
     */
    public cellOccupier(cell: Position<MoveType, Range<Width>, Range<Height>>): number | null {
        for (let i = 0; i < this.numberOfPlayerBoards; i++) {
            if (this.data.getBit(this.getBitIndex(cell, i)) === 1)
                return i;
        }
        return null;
    }

    /**
     * Creates a string representation of the board.
     *
     * @public
     * @returns {string} The string representation.
     */
    public toString(): string {
        let unformattedBoard = "";
        for (let y = 0; y < this.boardHeight; y++) {
            for (let x = 0; x < this.boardWidth; x++) {
                const move = { x, y } as Position<MoveType, Range<Width>, Range<Height>>;
                unformattedBoard += `${(this.cellOccupier(move) ?? -1) + 1}${x < this.boardWidth - 1 ? " " : "\n"}`;
            }
        }
        return unformattedBoard;
    }

    /**
     * Gets a bit index from its coordinates and player ID.
     *
     * @protected
     * @param {Position<MoveType, Range<Width>, Range<Height>>} move The coordinates.
     * @param {number} playerId The player ID.
     * @returns {number} The bit index.
     */
    protected getBitIndex(move: Position<MoveType, Range<Width>, Range<Height>>, playerId: number): number {
        const moveIndex = this.getIndex(move);
        const bitBoardMoveIndex = moveIndex + this.boardWidth * this.boardHeight * playerId;
        return bitBoardMoveIndex;
    }

    /**
     * Gets a bit index from its coordinates.
     *
     * @private
     * @param {Position<MoveType, Range<Width>, Range<Height>>} move The coordinates.
     * @returns {number} The bit index.
     */
    private getIndex(move: Position<MoveType, Range<Width>, Range<Height>>): number {
        if (typeof move === "object" && move !== null && "x" in move && "y" in move)
            return (this.boardWidth as number) * (move.y as number) + (move.x as number);
        return move as number;
    }

    /**
     * Checks if a move is valid.
     *
     * @public
     * @abstract
     * @param {Position<MoveType>} move The move.
     * @returns {boolean} Whether or not it's valid.
     */
    public abstract moveIsValid(move: Position<MoveType>): boolean;

    /**
     * A BitBoard containing only the player's bits.
     *
     * @protected
     * @abstract
     * @param {number} playerId The player's ID.
     * @returns {BitBoardType} The player's bits.
     */
    protected abstract getPlayerBoard(playerId: number): BitBoardType;
}
