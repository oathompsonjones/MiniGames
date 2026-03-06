import Base, { Game } from "../../base/controller.js";
import type { GameConstructorOptions, PlayerType } from "../../base/controller.js";
import Board from "./board.js";
import type { Position } from "../../base/board.js";

/**
 * The default rendering function for TicTacToe.
 * @param controller - The controller to render.
 */
function defaultRender(controller: TicTacToe): void {
    /* eslint-disable no-console */
    console.clear();
    console.log(controller.board.toString(false));
    const { winner } = controller.board;

    if (winner !== false)
        console.log(winner === null ? "It's a tie!" : `Player ${winner + 1} wins!`);
    /* eslint-enable no-console */
}

/** A game of TicTacToe. */
@Game
export default class TicTacToe extends Base<Board> {
    /**
     * Creates a new TicTacToe game.
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
        const optimalMove = this.findOptimalMove({ randomMove });

        switch (difficulty) {
            case "impossibleCPU":
                return optimalMove;
            case "hardCPU":
                return Math.random() < 0.8 ? optimalMove : randomMove;
            case "mediumCPU":
                return Math.random() < 0.5 ? optimalMove : randomMove;
            case "easyCPU":
                return randomMove;
            default:
                throw new Error("Invalid difficulty.");
        }
    }

    /**
     * Finds the optimal move for the current player.
     * @param algorithm - The algorithm to use.
     * @param algorithm.randomMove - The move to return if the board is empty.
     * @returns The optimal move for the current player.
     * @throws {Error} An error if the algorithm is invalid.
     */
    public findOptimalMove({ randomMove }: {
        randomMove: Position;
    } = { randomMove: { x: 2, y: 2 } }): Position {
        return this.board.isEmpty
            ? randomMove
            : this.alphabeta().move;
    }
}
