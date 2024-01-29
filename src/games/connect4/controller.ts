import type { Algorithm, GameConstructorOptions, PlayerType } from "../../base/controller.js";
import Base, { Game } from "../../base/controller.js";
import Board from "./board.js";
import Console from "../../console.js";
import type { Position } from "../../base/board.js";

/**
 * The default renderer for connect 4.
 * @param controller The controller to render.
 */
function defaultRender<T>(controller: Connect4<T>): void {
    Console.clear();
    Console.writeLine(controller.board.toString(true, true, false, ["⬤ ", "⬤ "]));
    const { winner } = controller.board;

    if (winner !== false)
        Console.writeLine(winner === null ? "It's a tie!" : `Player ${winner + 1} wins!`);
}

@Game
/** Represents the controller for connect 4. */
export default class Connect4<T> extends Base<T> {
    /**
     * Creates an instance of Connect4.
     * @param playerOneType The type of player one.
     * @param playerTwoType The type of player two.
     * @param options The options for the game.
     * */
    public constructor(playerOneType: PlayerType, playerTwoType: PlayerType, options: GameConstructorOptions<T>) {
        super(
            [playerOneType, playerTwoType],
            new Board(),
            options.renderer ?? defaultRender,
            options.id,
            options.onEnd,
            options.onInvalidInput,
        );
    }

    /**
     * Calculates the CPU's move.
     * @param difficulty The difficulty of the CPU.
     * @param algorithm The algorithm to use.
     * @returns The CPU's move.
     */
    public determineCPUMove(difficulty: Omit<PlayerType, "human">, algorithm: Algorithm = "alphabeta"): Position {
        const { emptyCells } = this.board;
        const randomMove = emptyCells[Math.floor(Math.random() * emptyCells.length)]!;

        switch (difficulty) {
            case "impossibleCPU":
                return this.findOptimalMove({ algorithm, maxDepth: 10 });
            case "hardCPU":
                return this.findOptimalMove({ algorithm, maxDepth: 5 });
            case "mediumCPU":
                return this.findOptimalMove({ algorithm, maxDepth: 3 });
            case "easyCPU":
                return randomMove;
            default:
                throw new Error("Invalid difficulty.");
        }
    }

    /**
     * Finds the optimal move for the current board state.
     * @param options The options for the algorithm.
     * @returns The optimal move.
     */
    public findOptimalMove(options?: {
        algorithm?: Algorithm;
        maxDepth?: number;
    }): Position {
        const { maxDepth = Infinity, algorithm = "alphabeta" } = options ?? {};

        if (this.board.isEmpty)
            return { x: 3, y: 5 };

        const minimax = this[algorithm](maxDepth);

        return minimax.move;
    }
}
