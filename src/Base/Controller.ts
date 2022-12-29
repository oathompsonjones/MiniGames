import type { Minimax, Player, Position, Range } from "../Types";
import { PlayerType, RenderType } from "../Utils";
import type { BitBoard } from "../BitBoard";
import type { Board } from "./";

/**
 * Represents a game controller.
 *
 * @abstract
 * @class Controller
 * @typedef {Controller}
 * @template BoardWidth extends number
 * @template BoardHeight extends number
 * @template BoardType extends BitBoard
 */
export abstract class Controller<BoardWidth extends number, BoardHeight extends number, BoardType extends BitBoard> {
    /**
     * Contains the board.
     *
     * @protected
     * @readonly
     * @type {Board<BoardWidth, BoardHeight, BoardType>}
     */
    protected readonly board: Board<BoardWidth, BoardHeight, BoardType>;

    /**
     * Contains the player objects.
     *
     * @protected
     * @readonly
     * @type {Array<Player<PlayerType>>}
     */
    protected readonly players: Array<Player<PlayerType>>;

    /**
     * Contains the rendering type.
     *
     * @private
     * @readonly
     * @type {RenderType}
     */
    private readonly renderType: RenderType;

    /**
     * Contains the ID of the current player.
     *
     * @private
     * @type {number}
     */
    private currentPlayerId: number = 0;

    /**
     * Creates an instance of Controller.
     *
     * @constructor
     * @protected
     * @param {Board<BoardWidth, BoardHeight, BoardType>} board The board.
     * @param {PlayerType[]} playerTypes The types of player.
     * @param {RenderType} renderType The rendering type.
     */
    protected constructor(board: Board<BoardWidth, BoardHeight, BoardType>, playerTypes: PlayerType[], renderType: RenderType) {
        this.board = board;
        this.players = playerTypes.map((playerType, id) => ({ id, playerType }));
        this.renderType = renderType;
    }

    /**
     * Gets the current player object.
     *
     * @public
     * @readonly
     * @type {Player<PlayerType>}
     */
    public get currentPlayer(): Player<PlayerType> {
        return this.players[this.currentPlayerId]!;
    }

    /**
     * Controls the main game flow.
     *
     * @public
     * @async
     * @returns {(Promise<number | null>)} The winner.
     */
    public async play(): Promise<number | null> {
        this.render(this.board.winner);
        while (this.board.winner === false) {
            let move: Position<Range<BoardWidth>, Range<BoardHeight>>;
            if (this.currentPlayer.playerType === PlayerType.Human) {
                // eslint-disable-next-line no-await-in-loop
                move = await this.getValidMove();
            } else {
                move = this.determineCPUMove(this.currentPlayer.playerType);
            }
            this.board.makeMove(move, this.currentPlayer.id);
            this.render(this.board.winner);
            this.nextTurn();
        }
        return this.board.winner;
    }

    /**
     * The minimax algorithm.
     *
     * @link https://en.wikipedia.org/wiki/Minimax
     * @public
     * @param {number} [depth=Infinity] The depth of the algorithm.
     * @param {boolean} [maximisingPlayer=true] Whether or not the current player is the maximising player.
     * @returns {Minimax<BoardWidth, BoardHeight>} The optimal move.
     */
    public minimax(depth: number = Infinity, maximisingPlayer: boolean = true): Minimax<BoardWidth, BoardHeight> {
        const playerIds = [(this.currentPlayerId + 1) % 2, this.currentPlayerId];
        if (depth === 0 || this.board.winner !== false) {
            return {
                move:  null as unknown as Minimax<BoardWidth, BoardHeight>["move"],
                score: this.board.heuristic * (this.currentPlayerId === 1 ? 1 : -1)
            };
        }
        const scores: Array<Minimax<BoardWidth, BoardHeight>> = [];
        const { emptyCells } = this.board;
        for (const move of emptyCells) {
            this.board.makeMove(move, playerIds[Number(maximisingPlayer)]!);
            const score = emptyCells.length * this.minimax(depth - 1, !maximisingPlayer).score;
            scores.push({ move, score });
            this.board.undoLastMove();
        }
        return scores.sort((a, b) => (maximisingPlayer ? a.score - b.score : b.score - a.score))[0]!;
    }

    /**
     * Changes which player's turn it is.
     *
     * @public
     */
    public nextTurn(): void {
        this.currentPlayerId = (this.currentPlayerId + 1) % this.players.length;
    }

    /**
     * Renders the game.
     *
     * @public
     * @param {(number | false | null)} winner The output of get winner.
     */
    public render(winner: number | false | null): void {
        switch (this.renderType) {
            case RenderType.Console:
                return this.renderToConsole(winner);
            case RenderType.Canvas:
                return this.renderToCanvas(winner);
        }
    }

    /**
     * Gets the game input.
     *
     * @public
     * @async
     * @returns {Promise<Position>} The input.
     */
    public async getInput(): Promise<Position> {
        switch (this.renderType) {
            case RenderType.Console:
                return this.getConsoleInput();
            case RenderType.Canvas:
                return this.getCanvasInput();
        }
    }

    /**
     * Gets a valid move input.
     *
     * @public
     * @async
     * @returns {Promise<Position<Range<BoardWidth>, Range<BoardHeight>>>} The valid move.
     */
    public async getValidMove(): Promise<Position<Range<BoardWidth>, Range<BoardHeight>>> {
        let move: Position;
        do
            // eslint-disable-next-line no-await-in-loop
            move = await this.getInput();
        while (!this.board.moveIsValid(move));
        return move as Position<Range<BoardWidth>, Range<BoardHeight>>;
    }

    /**
     * Gets input from the console.
     *
     * @public
     * @abstract
     * @returns {Promise<Position>} The input.
     */
    public abstract getConsoleInput(): Promise<Position>;

    /**
     * Gets input from the canvas.
     *
     * @public
     * @abstract
     * @returns {Promise<Position>} The input.
     */
    public abstract getCanvasInput(): Promise<Position>;

    /**
     * Renders to the console.
     *
     * @public
     * @abstract
     * @param {(number | false | null)} winner The output of get winner.
     */
    public abstract renderToConsole(winner: number | false | null): void;

    /**
     * Renders to the canvas.
     *
     * @public
     * @abstract
     * @param {(number | false | null)} winner The output of get winner.
     */
    public abstract renderToCanvas(winner: number | false | null): void;

    /**
     * Determines the CPU move.
     *
     * @public
     * @abstract
     * @param {Omit<PlayerType, PlayerType.Human>} difficulty The difficulty of the AI.
     * @returns {Position<Range<BoardWidth>, Range<BoardHeight>>} The move.
     */
    public abstract determineCPUMove(difficulty: Omit<PlayerType, PlayerType.Human>): Position<Range<BoardWidth>, Range<BoardHeight>>;

    /**
     * Finds the optimal move.
     *
     * @public
     * @abstract
     * @returns {(Position<Range<BoardWidth>, Range<BoardHeight>> | null)} The optimal move.
     */
    public abstract findOptimalMove(): Position<Range<BoardWidth>, Range<BoardHeight>> | null;
}
