import { IntBitBoard, LongInt, LongIntBitBoard } from "../BitBoard";
import type { MoveDimensions, Position, Range } from "../Utils";
import type { BitBoard } from "../BitBoard";

export abstract class Board<
    Width extends number,
    Height extends number,
    BitBoardType extends BitBoard,
    MoveType extends MoveDimensions
> {
    protected readonly data: BitBoardType;

    protected readonly boardWidth: Width;

    protected readonly boardHeight: Height;

    private readonly bitsPerBoard: number;

    private readonly numberOfPlayerBoards: number;

    private readonly numberOfBoards: number;

    private readonly moves: number[] = [];

    protected abstract readonly winningStates: BitBoardType[];

    protected constructor(width: Width, height: Height, playerBoardCount: number, extraBoardCount: number = 0) {
        this.boardWidth = width;
        this.boardHeight = height;
        this.bitsPerBoard = this.boardWidth * this.boardHeight;
        this.numberOfPlayerBoards = playerBoardCount;
        this.numberOfBoards = this.numberOfPlayerBoards + extraBoardCount;
        const totalBits = this.bitsPerBoard * this.numberOfBoards;
        this.data = (totalBits > 32 ? new LongIntBitBoard(Math.ceil(totalBits / 32)) : new IntBitBoard()) as BitBoardType;
    }

    public get isFull(): boolean {
        let isFull = (this.data instanceof LongIntBitBoard
            ? new LongIntBitBoard(Math.ceil(this.bitsPerBoard / 32))
            : new IntBitBoard()) as BitBoardType;
        for (let i = 0; i < this.numberOfPlayerBoards; i++)
            isFull = isFull.or(this.getPlayerBoard(i)) as BitBoardType;
        if (isFull instanceof LongIntBitBoard) {
            const arr = Array<number>(Math.ceil(this.bitsPerBoard / 32)).fill(~0 >>> 0);
            arr[arr.length - 1] = 2 ** (this.bitsPerBoard - (arr.length - 1) * 32) - 1;
            return isFull.equals(new LongInt(arr));
        }
        return isFull.equals(2 ** this.bitsPerBoard - 1);
    }

    public get isEmpty(): boolean {
        let isEmpty = (this.data instanceof LongIntBitBoard
            ? new LongIntBitBoard(Math.ceil(this.bitsPerBoard / 32))
            : new IntBitBoard()) as BitBoardType;
        for (let i = 0; i < this.numberOfPlayerBoards; i++)
            isEmpty = isEmpty.or(this.getPlayerBoard(i)) as BitBoardType;
        return isEmpty.equals(0);
    }

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

    public abstract get heuristic(): number;

    public makeMove(move: Position<MoveType, Range<Width>, Range<Height>>, playerId: number): void {
        const bit = this.getBitIndex(move, playerId);
        this.moves.push(bit);
        this.data.setBit(bit);
    }

    public undoLastMove(): void {
        const lastMove = this.moves.pop();
        if (lastMove === undefined)
            throw new Error("No move to undo.");
        this.data.clearBit(lastMove);
    }

    public cellOccupier(cell: Position<MoveType, Range<Width>, Range<Height>>): number | null {
        for (let i = 0; i < this.numberOfPlayerBoards; i++) {
            if (this.data.getBit(this.getBitIndex(cell, i)) === 1)
                return i;
        }
        return null;
    }

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

    protected getBitIndex(move: Position<MoveType, Range<Width>, Range<Height>>, playerId: number): number {
        const moveIndex = this.getIndex(move);
        const bitBoardMoveIndex = moveIndex + this.bitsPerBoard * playerId;
        return bitBoardMoveIndex;
    }

    private getIndex(move: Position<MoveType, Range<Width>, Range<Height>>): number {
        if (typeof move === "object" && move !== null && "x" in move && "y" in move)
            return (this.boardWidth as number) * (move.y as number) + (move.x as number);
        return move as number;
    }

    public abstract moveIsValid(move: Position<MoveType>): boolean;

    protected abstract getPlayerBoard(playerId: number): BitBoardType;
}
