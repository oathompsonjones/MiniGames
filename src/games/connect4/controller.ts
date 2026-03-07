import Base, { Game } from "../../base/controller.js";
import type { GameConstructorOptions, PlayerType } from "../../base/controller.js";
import Board from "./board.js";
import type { Position } from "../../base/board.js";

/**
 * The default renderer for connect 4.
 * @param controller - The controller to render.
 */
function defaultRender(controller: Connect4): void {
    /* eslint-disable no-console */
    console.clear();
    console.log(controller.board.toString(true, true, false, ["⬤ ", "⬤ "]));
    const { winner } = controller.board;

    if (winner !== false)
        console.log(winner === null ? "It's a tie!" : `Player ${winner + 1} wins!`);
    /* eslint-enable no-console */
}

/** Represents the controller for connect 4. */
@Game
export default class Connect4 extends Base<Board> {
    /**
     * Creates an instance of Connect4.
     * @param playerOneType - The type of player one (human or CPU).
     * @param playerTwoType - The type of player two (human or CPU).
     * @param options - The options for the game.
     */
    public constructor(
        playerOneType: PlayerType,
        playerTwoType: PlayerType,
        options?: GameConstructorOptions<Board>,
    ) {
        super(
            [playerOneType, playerTwoType],
            new Board(),
            options?.renderer ?? defaultRender,
            options?.onEnd,
            options?.onInvalidInput,
        );
    }

    /**
     * Calculates the CPU's move.
     * @param difficulty - The difficulty of the CPU.
     * @returns The CPU's move.
     * @throws {Error} An error if the difficulty is invalid.
     */
    public determineCPUMove(difficulty: Omit<PlayerType, "human">): Position {
        const { emptyCells } = this.board;
        const randomMove = emptyCells[Math.floor(Math.random() * emptyCells.length)]!;

        switch (difficulty) {
            case "impossibleCPU":
                return this.findOptimalMove({ maxDepth: 10 });
            case "hardCPU":
                return this.findOptimalMove({ maxDepth: 7 });
            case "mediumCPU":
                return this.findOptimalMove({ maxDepth: 5 });
            case "easyCPU":
                return randomMove;
            default:
                throw new Error("Invalid difficulty.");
        }
    }

    /**
     * Finds the optimal move for the current board state.
     * @param options - The options for the algorithm.
     * @param options.maxDepth - The maximum depth to search.
     * @returns The optimal move for the current board state.
     * @throws {Error} An error if the algorithm is invalid.
     */
    public findOptimalMove({ maxDepth }: { maxDepth: number; } = { maxDepth: Infinity }): Position {
        return this.board.isEmpty
            ? { x: 3, y: 5 }
            : this.search(maxDepth).move;
    }
}
