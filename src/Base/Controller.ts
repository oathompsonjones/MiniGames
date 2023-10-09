import type BitBoard from "../BitBoard/BitBoard.js";
import type Board from "./Board.js";
import type { Position } from "./Board.js";

export type RenderType = "canvas" | "console";
export type PlayerType = "easyCPU" | "hardCPU" | "human" | "impossibleCPU" | "mediumCPU";

/**
 * Represents a game controller.
 *
 * @abstract
 * @class Controller
 * @typedef {Controller}
 * @template BoardType extends BitBoard
 */
export default abstract class Controller<BoardType extends BitBoard = BitBoard> {
    /**
     * Contains the board.
     *
     * @protected
     * @readonly
     * @type {Board<BoardType>}
     */
    protected readonly board: Board<BoardType>;

    /**
     * Contains the player objects.
     *
     * @protected
     * @readonly
     * @type {Array<Player<PlayerType>>}
     */
    protected readonly players: Array<{
        id: number;
        playerType: PlayerType;
    }>;

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
     * @param {Board<BoardType>} board The board.
     * @param {PlayerType[]} playerTypes The types of player.
     * @param {RenderType} renderType The rendering type.
     */
    protected constructor(board: Board<BoardType>, playerTypes: PlayerType[], renderType: RenderType) {
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
    public get currentPlayer(): {
        id: number;
        playerType: PlayerType;
    } {
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
            let move: Position;
            if (this.currentPlayer.playerType === "human") {
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
     * @param {number} [alpha=-Infinity] The bounds for the alpha-beta variation of the algorithm.
     * @param {number} [beta=Infinity] The bounds for the alpha-beta variation of the algorithm.
     * @param {boolean} [maximisingPlayer=true] Whether or not the current player is the maximising player.
     * @returns {{ move: Position; score: number; }} The optimal move.
     */
    public minimax(
        depth: number = Infinity,
        alpha: number = -Infinity,
        beta: number = Infinity,
        maximisingPlayer: boolean = true
    ): { move: Position; score: number; } {
        const playerIds = [(this.currentPlayerId + 1) % 2, this.currentPlayerId] as const;
        if (depth === 0 || this.board.winner !== false) {
            return {
                move: { x: NaN, y: NaN },
                score: this.board.heuristic * (this.currentPlayerId === 0 ? 1 : -1)
            };
        }
        let bestMove: ReturnType<typeof this.minimax> = {
            move: { x: NaN, y: NaN },
            score: maximisingPlayer ? -Infinity : Infinity
        };
        const { emptyCells } = this.board;
        for (const move of emptyCells) {
            this.board.makeMove(move, playerIds[Number(maximisingPlayer)]!);
            const score = (9 - emptyCells.length) * this.minimax(depth - 1, alpha, beta, !maximisingPlayer).score;
            this.board.undoLastMove();
            if (maximisingPlayer) {
                const bestScore = Math.max(score, bestMove.score);
                if (bestScore !== bestMove.score)
                    bestMove = { move, score };
                if (bestMove.score > beta)
                    break;
                // eslint-disable-next-line no-param-reassign
                alpha = Math.max(alpha, bestScore);
            } else {
                const bestScore = Math.min(score, bestMove.score);
                if (bestScore !== bestMove.score)
                    bestMove = { move, score };
                if (bestMove.score < alpha)
                    break;
                // eslint-disable-next-line no-param-reassign
                beta = Math.min(beta, bestScore);
            }
        }
        return bestMove;
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
            case "console":
                return this.renderToConsole(winner);
            case "canvas":
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
            case "console":
                return this.getConsoleInput();
            case "canvas":
                return this.getCanvasInput();
        }
    }

    /**
     * Gets a valid move input.
     *
     * @public
     * @async
     * @returns {Promise<Position>} The valid move.
     */
    public async getValidMove(): Promise<Position> {
        let move: Position;
        do
            // eslint-disable-next-line no-await-in-loop
            move = await this.getInput();
        while (!this.board.moveIsValid(move));
        return move;
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
     * @returns {Position} The move.
     */
    public abstract determineCPUMove(difficulty: Omit<PlayerType, "human">): Position;

    /**
     * Finds the optimal move.
     *
     * @public
     * @abstract
     * @returns {(Position | null)} The optimal move.
     */
    public abstract findOptimalMove(): Position | null;
}
