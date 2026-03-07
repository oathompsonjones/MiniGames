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

    /** Contains the transposition table for the minimax algorithm. */
    private readonly transposition = new Map<number, { depth: number; score: number; }>();

    /** Contains the best moves for the minimax algorithm. */
    private readonly bestMoves = new Map<number, Position>();

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
     * A wrapper for the minimax algorithm to find the optimal move for the current board state.
     * @param maxDepth - The maximum depth to search.
     * @returns The optimal move for the current board state.
     */
    protected search(maxDepth: number): { move: Position; score: number; } {
        let best: { move: Position; score: number; } = {
            move: { x: NaN, y: NaN },
            score: -Infinity,
        };

        for (let depth = 1; depth <= maxDepth; depth++)
            best = this.minimax(depth, -Infinity, Infinity, this.currentPlayerId);

        return best;
    }

    /**
     * The minimax (negamax) algorithm with alpha-beta pruning (https://en.wikipedia.org/wiki/Minimax).
     * @param depth - The depth of the algorithm.
     * @param alpha - The bounds for the alpha-beta variation of the algorithm.
     * @param beta - The bounds for the alpha-beta variation of the algorithm.
     * @param playerId - The player to calculate the move for.
     * @returns The optimal move.
     */
    // eslint-disable-next-line max-statements
    private minimax(depth: number, alpha: number, beta: number, playerId: number): { move: Position; score: number; } {
        const { board } = this;
        const { hash } = board;

        const cached = this.transposition.get(hash);

        if (cached && cached.depth >= depth) {
            return {
                move: this.bestMoves.get(hash) ?? { x: NaN, y: NaN },
                score: cached.score,
            };
        }

        if (depth === 0 || board.winner !== false) {
            const score = board.heuristic * (playerId === 0 ? 1 : -1);

            this.transposition.set(hash, { depth, score });

            return {
                move: { x: NaN, y: NaN },
                score,
            };
        }

        const moves = [...board.emptyCells];

        // Move ordering: try previously best move first
        const bestStored = this.bestMoves.get(hash);

        if (bestStored) {
            const index = moves.findIndex((m) => m.x === bestStored.x && m.y === bestStored.y);

            if (index > 0)
                moves.unshift(moves.splice(index, 1)[0]!);
        }

        let bestScore = -Infinity;
        let bestMove: Position | null = null;

        // eslint-disable-next-line @typescript-eslint/prefer-for-of
        for (let i = 0; i < moves.length; i++) {
            const move = moves[i]!;

            board.makeMove(move, playerId);

            const { score } = this.minimax(
                depth - 1,
                -beta,
                -alpha,
                playerId ^ 1,
            );

            const value = -score;

            board.undoLastMove();

            if (value > bestScore) {
                bestScore = value;
                bestMove = move;
            }

            if (value > alpha)
                // eslint-disable-next-line no-param-reassign
                alpha = value;

            if (alpha >= beta)
                break;
        }

        if (bestMove) {
            this.transposition.set(hash, { depth, score: bestScore });
            this.bestMoves.set(hash, bestMove);
        }

        return {
            move: bestMove ?? { x: NaN, y: NaN },
            score: bestScore,
        };
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
