import type Board from "./board.js";
import { EventEmitter } from "eventemitter3";
import type LongInt from "../bitBoard/longInt.js";
import type { Position } from "./board.js";

export type PlayerType = "easyCPU" | "hardCPU" | "human" | "impossibleCPU" | "mediumCPU";
export type Algorithm = "alphabeta" | "minimax";
export type GameConstructorOptions<T> = {
    id: T;
    onEnd?: (winner: number | null) => Promise<void> | void;
    onInvalidInput?: (position: Position) => Promise<void> | void;
    renderer?: (controller: Controller<T>) => Promise<void> | void;
};
export type GameConstructor<T> = {
    // eslint-disable-next-line @typescript-eslint/prefer-function-type
    new(playerOneType: PlayerType, playerTwoType: PlayerType, options: GameConstructorOptions<T>): Controller<T>;
};
/**
 * Decorator to check that the constructor type for the given class is correct.
 * @template T - The type of the game ID.
 * @param constructor - The class to check.
 */
export function Game<T>(constructor: GameConstructor<T>): void {
    void constructor;
}

/**
 * Represents a game controller.
 * @template T - The type of the game ID.
 */
export default abstract class Controller<T> extends EventEmitter<{
    end: GameConstructorOptions<T>["onEnd"];
    input: GameConstructorOptions<T>["onInvalidInput"];
    invalidInput: GameConstructorOptions<T>["onInvalidInput"];
}> {
    /** Contains the ID of the game. */
    public readonly gameID: T;

    /** Contains the board. */
    public readonly board: Board<LongInt | number>;

    /** Contains the view object. */
    public readonly render: Required<GameConstructorOptions<T>>["renderer"];

    /** Contains the player objects. */
    protected readonly players: Array<{ id: number; playerType: PlayerType; }>;

    /** Contains the ID of the current player. */
    private currentPlayerId: number = 0;

    /**
     * Creates an instance of Controller.
     * @param playerTypes - The types of player for the game.
     * @param board - The board object.
     * @param render - The render function.
     * @param gameID - The ID of the game instance.
     * @param onEnd - The function to call when the game ends.
     * @param onInvalidInput - The function to call when the input is invalid.
     */
    // eslint-disable-next-line @typescript-eslint/max-params
    protected constructor(
        playerTypes: PlayerType[],
        board: Board<LongInt | number>,
        render: Controller<T>["render"],
        gameID: T,
        onEnd?: GameConstructorOptions<T>["onEnd"],
        onInvalidInput?: GameConstructorOptions<T>["onInvalidInput"],
    ) {
        super();
        this.gameID = gameID;
        this.board = board;
        this.players = playerTypes.map((playerType, id) => ({ id, playerType }));
        this.render = render;

        if (onEnd !== undefined)
            this.on("end", onEnd);

        if (onInvalidInput !== undefined)
            this.on("invalidInput", onInvalidInput);
    }

    /**
     * Gets the current player object.
     * @returns The current player object.
     */
    public get currentPlayer(): { id: number; playerType: PlayerType; } {
        return this.players[this.currentPlayerId]!;
    }

    /**
     * Controls the main game flow.
     * @param algorithm - The algorithm to use.
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
     * The bog standard minimax algorithm. Left in for reference (https://en.wikipedia.org/wiki/Minimax).
     * @param depth - The depth of the algorithm.
     * @param maximisingPlayer - Whether or not the current player is the maximising player.
     * @returns The optimal move.
     */
    protected minimax(depth: number = Infinity, maximisingPlayer: boolean = true): { move: Position; score: number; } {
        const playerIds = [(this.currentPlayerId + 1) % 2, this.currentPlayerId] as const;

        if (depth === 0 || this.board.winner !== false) {
            return {
                move: { x: NaN, y: NaN },
                score: this.board.heuristic * (this.currentPlayerId === 0 ? 1 : -1),
            };
        }

        let bestMove: ReturnType<typeof this.minimax> = {
            move: { x: NaN, y: NaN },
            score: maximisingPlayer ? -Infinity : Infinity,
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
     * The minimax algorithm with alpha-beta pruning (https://en.wikipedia.org/wiki/Minimax).
     * @param depth - The depth of the algorithm.
     * @param alpha - The bounds for the alpha-beta variation of the algorithm.
     * @param beta - The bounds for the alpha-beta variation of the algorithm.
     * @param maximisingPlayer - Whether or not the current player is the maximising player.
     * @returns The optimal move.
     */
    protected alphabeta(
        depth: number = Infinity,
        alpha: number = -Infinity,
        beta: number = Infinity,
        maximisingPlayer: boolean = true,
    ): { move: Position; score: number; } {
        const playerIds = [(this.currentPlayerId + 1) % 2, this.currentPlayerId] as const;

        if (depth === 0 || this.board.winner !== false) {
            return {
                move: { x: NaN, y: NaN },
                score: this.board.heuristic * (this.currentPlayerId === 0 ? 1 : -1),
            };
        }

        let bestMove: ReturnType<typeof this.alphabeta> = {
            move: { x: NaN, y: NaN },
            score: maximisingPlayer ? -Infinity : Infinity,
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

    /** Changes which player's turn it is. */
    private nextTurn(): void {
        this.currentPlayerId = (this.currentPlayerId + 1) % this.players.length;
    }

    /**
     * Makes a move.
     * @param input - Either the algorithm to use to calculate the move or the move itself.
     */
    private async makeMove(input: Algorithm | Position): Promise<void> {
        if (typeof input === "string") {
            this.board.makeMove(this.determineCPUMove(this.currentPlayer.playerType, input), this.currentPlayer.id);
        } else {
            if (this.currentPlayer.playerType !== "human" || !this.board.moveIsValid(input)) {
                this.emit("invalidInput", input);

                return;
            }

            this.board.makeMove(input, this.currentPlayer.id);
        }

        await this.render(this);
        const { winner } = this.board;

        if (winner !== false) {
            this.emit("end", winner);

            return;
        }

        this.nextTurn();
    }

    /**
     * Determines the CPU move.
     * @param difficulty - The difficulty of the AI.
     * @param algorithm - The algorithm to use.
     * @returns The move.
     */
    public abstract determineCPUMove(difficulty: Omit<PlayerType, "human">, algorithm?: Algorithm): Position;

    /**
     * Finds the optimal move.
     * @param options - The options to use.
     * @param options.algorithm - The algorithm to use.
     * @param options.maxDepth - The maximum depth to search.
     * @param options.randomMove - A random move to make.
     * @returns The optimal move to make.
     */
    public abstract findOptimalMove(options?: {
        algorithm?: Algorithm;
        maxDepth?: number;
        randomMove?: Position;
    }): Position;
}
