import type { Minimax, MoveDimensions, Player, PlayerType, Position, Range } from "../Utils";
import type { BitBoard } from "../BitBoard";
import type { Board } from "./";
import { RenderType } from "../Utils/Constants";

export abstract class Controller<
    BoardWidth extends number,
    BoardHeight extends number,
    BoardType extends BitBoard,
    MoveType extends MoveDimensions = MoveDimensions.TwoDimensional
> {
    protected readonly board: Board<BoardWidth, BoardHeight, BoardType, MoveType>;

    protected readonly players: Array<Player<PlayerType>>;

    private readonly renderType: RenderType;

    private currentPlayerId: number = 0;

    protected constructor(
        board: Board<BoardWidth, BoardHeight, BoardType, MoveType>,
        playerTypes: PlayerType[],
        renderType: RenderType
    ) {
        this.board = board;
        this.players = playerTypes.map((playerType, id) => ({ id, playerType }));
        this.renderType = renderType;
    }

    public get currentPlayer(): Player<PlayerType> {
        return this.players[this.currentPlayerId]!;
    }

    public minimax(depth: number = Infinity, maximisingPlayer: boolean = true): Minimax<MoveType, BoardWidth, BoardHeight> {
        const playerIds = [(this.currentPlayerId + 1) % 2, this.currentPlayerId];
        if (depth === 0 || this.board.winner !== false) {
            return {
                move:  null as Minimax<MoveType, BoardWidth, BoardHeight>["move"],
                score: this.board.heuristic * (this.currentPlayerId === 1 ? 1 : -1)
            };
        }
        const scores: Array<Minimax<MoveType, BoardWidth, BoardHeight>> = [];
        const { emptyCells } = this.board;
        for (const move of emptyCells) {
            this.board.makeMove(move, playerIds[Number(maximisingPlayer)]!);
            const score = emptyCells.length * this.minimax(depth - 1, !maximisingPlayer).score;
            scores.push({ move, score });
            this.board.undoLastMove();
        }
        return scores.sort((a, b) => (maximisingPlayer ? a.score - b.score : b.score - a.score))[0]!;
    }

    public nextTurn(): void {
        this.currentPlayerId = (this.currentPlayerId + 1) % this.players.length;
    }

    public render(winner: number | false | null): void {
        switch (this.renderType) {
            case RenderType.Canvas:
                return this.renderToCanvas(winner);
            case RenderType.Console:
                return this.renderToConsole(winner);
        }
    }

    public async getInput(): Promise<Position<MoveType>> {
        switch (this.renderType) {
            case RenderType.Canvas:
                return this.getCanvasInput();
            case RenderType.Console:
                return this.getConsoleInput();
        }
    }

    public async getValidMove(): Promise<Position<MoveType, Range<BoardWidth>, Range<BoardHeight>>> {
        let move: Position<MoveType>;
        do
            // eslint-disable-next-line no-await-in-loop
            move = await this.getInput();
        while (!this.board.moveIsValid(move));
        return move as Position<MoveType, Range<BoardWidth>, Range<BoardHeight>>;
    }

    public abstract play(): Promise<number | null>;
    public abstract getCanvasInput(): Promise<Position<MoveType>>;
    public abstract getConsoleInput(): Promise<Position<MoveType>>;
    public abstract renderToCanvas(winner: number | false | null): void;
    public abstract renderToConsole(winner: number | false | null): void;
    public abstract determineCPUMove(difficulty: Omit<PlayerType, PlayerType.Human>): Position<MoveType, Range<BoardWidth>, Range<BoardHeight>>;
    public abstract findOptimalMove(): Position<MoveType, Range<BoardWidth>, Range<BoardHeight>> | null;
}
