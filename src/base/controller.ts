import type Board from "./board.js";
import { EventEmitter } from "eventemitter3";
import type LongInt from "../bitBoard/longInt.js";
import type { Position } from "./board.js";

export type PlayerType = "easyCPU" | "hardCPU" | "human" | "impossibleCPU" | "mediumCPU";

export type GameConstructorOptions<T extends Board<LongInt | number>> = {
    onEnd?: (winner: number | null) => Promise<void> | void;
    onInvalidInput?: (position: Position) => Promise<void> | void;
    renderer?: (controller: Controller<T>) => Promise<void> | void;
};
export type GameConstructor<T extends Board<LongInt | number>> = {
    // eslint-disable-next-line @typescript-eslint/prefer-function-type
    new(playerOneType: PlayerType, playerTwoType: PlayerType, options?: GameConstructorOptions<T>): Controller<T>;
};
/**
 * Decorator to check that the constructor type for the given class is correct.
 * @template T - The type of board.
 * @param constructor - The class to check.
 */
export function Game<T extends Board<LongInt | number>>(constructor: GameConstructor<T>): void {
    void constructor;
}

/**
 * Represents a game controller.
 * @template T - The type of board.
 */
export default abstract class Controller<T extends Board<LongInt | number>> extends EventEmitter<{
    end: GameConstructorOptions<T>["onEnd"];
    input: GameConstructorOptions<T>["onInvalidInput"];
    invalidInput: GameConstructorOptions<T>["onInvalidInput"];
}> {
    /** Contains the board. */
    public readonly board: T;

    /** Contains the view object. */
    public readonly render: () => Promise<void> | void;

    /** Contains the player objects. */
    protected readonly players: Array<{ id: number; playerType: PlayerType; }>;

    /** Contains the ID of the current player. */
    private currentPlayerId: number = 0;

    /** Stores precomputed values to optimise minimax/alphabeta. */
    private readonly cache = new Map<string, { move: Position; score: number; }>();

    /**
     * Creates an instance of Controller.
     * @param playerTypes - The types of player for the game.
     * @param board - The board object.
     * @param render - The render function.
     * @param onEnd - The function to call when the game ends.
     * @param onInvalidInput - The function to call when the input is invalid.
     */

    protected constructor(
        playerTypes: PlayerType[],
        board: T,
        render: Required<GameConstructorOptions<T>>["renderer"],
        onEnd?: GameConstructorOptions<T>["onEnd"],
        onInvalidInput?: GameConstructorOptions<T>["onInvalidInput"],
    ) {
        super();
        this.board = board;
        this.players = playerTypes.map((playerType, id) => ({ id, playerType }));
        this.render = render.bind(null, this);

        if (onEnd !== undefined)
            this.on("end", onEnd as () => void);

        if (onInvalidInput !== undefined)
            this.on("invalidInput", onInvalidInput as () => void);
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
     * @returns The winner or null in the event of a tie.
     */
    public async play(): Promise<void> {
        await this.render();
        this.on("input", (async (move: Position): Promise<void> => {
            await this.makeMove(move);

            if (this.currentPlayer.playerType !== "human")
                await this.makeMove();
        }) as (move: Position) => void);

        while (this.currentPlayer.playerType !== "human" && this.board.winner === false)
            // eslint-disable-next-line no-await-in-loop
            await this.makeMove();
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
        const playerIds = [(this.currentPlayerId + 1) % 2, this.currentPlayerId];

        if (depth === 0 || this.board.winner !== false) {
            return {
                move: { x: NaN, y: NaN },
                score: this.board.heuristic * (this.currentPlayerId === 0 ? 1 : -1),
            };
        }

        if (this.cache.has(this.board.toString()))
            return this.cache.get(this.board.toString())!;

        let bestMove = {
            move: { x: NaN, y: NaN },
            score: maximisingPlayer ? -Infinity : Infinity,
        };
        const { emptyCells } = this.board;

        for (const move of emptyCells) {
            this.board.makeMove(move, playerIds[Number(maximisingPlayer)]!);
            const { score } = this.alphabeta(depth - 1, alpha, beta, !maximisingPlayer);

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

        this.cache.set(this.board.toString(), bestMove);

        return bestMove;
    }

    /** Changes which player's turn it is. */
    private nextTurn(): void {
        this.currentPlayerId = (this.currentPlayerId + 1) % this.players.length;
    }

    /**
     * Makes a move.
     * @param input - The move to make. If ommitted, the move will be calculated for the CPU.
     */
    private async makeMove(input?: Position): Promise<void> {
        if (input === undefined) {
            this.board.makeMove(this.determineCPUMove(this.currentPlayer.playerType, input), this.currentPlayer.id);
        } else {
            if (this.currentPlayer.playerType !== "human" || !this.board.moveIsValid(input)) {
                this.emit("invalidInput", input);

                return;
            }

            this.board.makeMove(input, this.currentPlayer.id);
        }

        await this.render();
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
     * @param options.maxDepth - The maximum depth to search.
     * @param options.randomMove - A random move to make.
     * @returns The optimal move to make.
     */
    public abstract findOptimalMove(options?: {
        maxDepth?: number;
        randomMove?: Position;
    }): Position;
}
