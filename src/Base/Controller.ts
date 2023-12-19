import type Board from "./Board.js";
import type { Position } from "./Board.js";
import type View from "./View.js";

export type PlayerType = "easyCPU" | "hardCPU" | "human" | "impossibleCPU" | "mediumCPU";
export type Algorithm = "alphabeta" | "minimax";

/**
 * Represents a game controller.
 */
export default abstract class Controller {
    /**
     * Contains the ID of the game.
     */
    public readonly gameID: string;

    /**
     * Contains the board.
     */
    public readonly board: Board;

    /**
     * Contains the player objects.
     */
    protected readonly players: Array<{ id: number; playerType: PlayerType; }>;

    /**
     * Contains the view object.
     */
    private readonly view: View;

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
    protected constructor(playerTypes: PlayerType[], view: View, gameID: string | undefined, board: Board) {
        this.gameID = gameID ?? Date.now().toString(16);
        this.board = board;
        this.board.setGameID(this.gameID);
        this.players = playerTypes.map((playerType, id) => ({ id, playerType }));
        this.view = view;
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
    public async play(algorithm: Algorithm = "alphabeta"): Promise<number | null> {
        this.view.render(this);
        while (this.board.winner === false) {
            let move: Position;
            if (this.currentPlayer.playerType === "human") {
                // eslint-disable-next-line no-await-in-loop
                move = await this.getValidMove();
            } else {
                move = this.determineCPUMove(this.currentPlayer.playerType, algorithm);
            }
            this.board.makeMove(move, this.currentPlayer.id);
            this.view.render(this);
            this.nextTurn();
        }
        return this.board.winner;
    }

    /**
     * The bog standard minimax algorithm. Left in for reference.
     *
     * @link https://en.wikipedia.org/wiki/Minimax
     * @param depth The depth of the algorithm.
     * @param maximisingPlayer Whether or not the current player is the maximising player.
     * @returns The optimal move.
     */
    public minimax(depth: number = Infinity, maximisingPlayer: boolean = true): { move: Position; score: number; } {
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
    public alphabeta(
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
    public nextTurn(): void {
        this.currentPlayerId = (this.currentPlayerId + 1) % this.players.length;
    }

    /**
     * Gets a valid move input.
     *
     * @returns The valid move.
     */
    public async getValidMove(): Promise<Position> {
        let move: Position;
        do
            // eslint-disable-next-line no-await-in-loop
            move = await this.view.getInput(this);
        while (!this.board.moveIsValid(move));
        return move;
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
