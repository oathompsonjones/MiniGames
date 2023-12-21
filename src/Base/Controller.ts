import type Board from "./Board.js";
import { EventEmitter } from "eventemitter3";
import type { Position } from "./Board.js";

export type PlayerType = "easyCPU" | "hardCPU" | "human" | "impossibleCPU" | "mediumCPU";
export type Algorithm = "alphabeta" | "minimax";
export interface GameConstructorOptions {
    id?: string;
    onEnd?: (winner: number | null) => Promise<void> | void;
    onInvalidInput?: (position: Position) => Promise<void> | void;
    renderer?: (controller: Controller) => Promise<void> | void;
}
export interface GameConstructor {
    // eslint-disable-next-line @typescript-eslint/prefer-function-type
    new (playerOneType: PlayerType, playerTwoType: PlayerType, options?: GameConstructorOptions): Controller;
}
export function Game(constructor: GameConstructor): void {
    void constructor;
}


/**
 * Represents a game controller.
 */
export default abstract class Controller extends EventEmitter<{
    end: GameConstructorOptions["onEnd"];
    input: GameConstructorOptions["onInvalidInput"];
    invalidInput: GameConstructorOptions["onInvalidInput"];
}> {
    /**
     * Contains the ID of the game.
     */
    public readonly gameID: string;

    /**
     * Contains the board.
     */
    public readonly board: Board;

    /**
     * Contains the view object.
     */
    public readonly render: Required<GameConstructorOptions>["renderer"];

    /**
     * Contains the player objects.
     */
    protected readonly players: Array<{ id: number; playerType: PlayerType; }>;

    /**
     * Contains the ID of the current player.
     */
    private currentPlayerId: number = 0;

    /**
     * Creates an instance of Controller.
     *
     * @param playerTypes The types of player.
     * @param view The view object.
     * @param gameID The ID of the game.
     * @param board The board.
     */
    // eslint-disable-next-line @typescript-eslint/max-params
    protected constructor(
        playerTypes: PlayerType[],
        board: Board,
        render: Controller["render"],
        gameID: string | undefined,
        onEnd?: (winner: number | null) => void,
        onInvalidInput?: () => void
    ) {
        super();
        this.gameID = gameID ?? Date.now().toString(16);
        this.board = board;
        this.board.setGameID(this.gameID);
        this.players = playerTypes.map((playerType, id) => ({ id, playerType }));
        this.render = render;
        if (onEnd !== undefined)
            this.on("end", onEnd);
        if (onInvalidInput !== undefined)
            this.on("invalidInput", onInvalidInput);
    }

    /**
     * Gets the current player object.
     */
    public get currentPlayer(): { id: number; playerType: PlayerType; } {
        return this.players[this.currentPlayerId]!;
    }

    /**
     * Controls the main game flow.
     *
     * @returns The winner or null in the event of a tie.
     */
    public async play(algorithm: Algorithm = "alphabeta"): Promise<void> {
        await this.render(this);
        this.on("input", async (move: Position): Promise<void> => {
            await this.makeMove(move);
            if (this.currentPlayer.playerType !== "human")
                await this.makeMove(algorithm);
        });
        while (this.currentPlayer.playerType !== "human" && this.board.winner === false)
            // eslint-disable-next-line no-await-in-loop
            await this.makeMove(algorithm);
    }

    /**
     * The bog standard minimax algorithm. Left in for reference.
     *
     * @link https://en.wikipedia.org/wiki/Minimax
     * @param depth The depth of the algorithm.
     * @param maximisingPlayer Whether or not the current player is the maximising player.
     * @returns The optimal move.
     */
    protected minimax(depth: number = Infinity, maximisingPlayer: boolean = true): { move: Position; score: number; } {
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
            const score = (9 - emptyCells.length) * this.minimax(depth - 1, !maximisingPlayer).score;
            this.board.undoLastMove();
            if (maximisingPlayer) {
                const bestScore = Math.max(score, bestMove.score);
                if (bestScore !== bestMove.score)
                    bestMove = { move, score };
            } else {
                const bestScore = Math.min(score, bestMove.score);
                if (bestScore !== bestMove.score)
                    bestMove = { move, score };
            }
        }
        return bestMove;
    }

    /**
     * The minimax algorithm with alpha-beta pruning.
     *
     * @link https://en.wikipedia.org/wiki/Minimax
     * @param depth The depth of the algorithm.
     * @param alpha The bounds for the alpha-beta variation of the algorithm.
     * @param beta The bounds for the alpha-beta variation of the algorithm.
     * @param maximisingPlayer Whether or not the current player is the maximising player.
     * @returns The optimal move.
     */
    protected alphabeta(
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
        let bestMove: ReturnType<typeof this.alphabeta> = {
            move: { x: NaN, y: NaN },
            score: maximisingPlayer ? -Infinity : Infinity
        };
        const { emptyCells } = this.board;
        for (const move of emptyCells) {
            this.board.makeMove(move, playerIds[Number(maximisingPlayer)]!);
            const score = (9 - emptyCells.length) * this.alphabeta(depth - 1, alpha, beta, !maximisingPlayer).score;
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
     */
    private nextTurn(): void {
        this.currentPlayerId = (this.currentPlayerId + 1) % this.players.length;
    }

    /**
     * Makes a move.
     *
     * @param input Either the algorithm to use to calculate the move or the move itself.
     */
    private async makeMove(input: Algorithm | Position): Promise<void> {
        if (typeof input === "string") {
            this.board.makeMove(this.determineCPUMove(this.currentPlayer.playerType, input), this.currentPlayer.id);
        } else {
            if (this.currentPlayer.playerType !== "human" || !this.board.moveIsValid(input))
                return void this.emit("invalidInput", input);
            this.board.makeMove(input, this.currentPlayer.id);
        }
        await this.render(this);
        const { winner } = this.board;
        if (winner !== false)
            return void this.emit("end", winner);
        this.nextTurn();
    }

    /**
     * Determines the CPU move.
     *
     * @param difficulty The difficulty of the AI.
     * @param algorithm The algorithm to use.
     * @returns The move.
     */
    public abstract determineCPUMove(difficulty: Omit<PlayerType, "human">, algorithm?: Algorithm): Position;

    /**
     * Finds the optimal move.
     *
     * @param options The options.
     * @returns The optimal move.
     */
    public abstract findOptimalMove(options?: { algorithm?: Algorithm; maxDepth?: number; randomMove?: Position; }): Position;
}
