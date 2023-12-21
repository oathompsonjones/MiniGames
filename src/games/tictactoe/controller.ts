import type { Algorithm, GameConstructorOptions, PlayerType } from "../../base/controller.js";
import Base, { Game } from "../../base/controller.js";
import Board from "./board.js";
import Console from "../../console.js";
import type { Position } from "../../base/board.js";

function defaultRender(controller: TicTacToe): void {
    Console.clear();
    Console.writeLine(controller.board.toString(false));
    const { winner } = controller.board;
    if (winner !== false)
        Console.writeLine(winner === null ? "It's a tie!" : `Player ${winner + 1} wins!`);
}

@Game
export default class TicTacToe extends Base {
    public constructor(playerOneType: PlayerType, playerTwoType: PlayerType, options?: GameConstructorOptions) {
        super(
            [playerOneType, playerTwoType],
            new Board(),
            options?.renderer ?? defaultRender,
            options?.id,
            options?.onEnd,
            options?.onInvalidInput
        );
    }

    public determineCPUMove(difficulty: Omit<PlayerType, "human">, algorithm: Algorithm = "alphabeta"): Position {
        const { emptyCells } = this.board;
        const randomMove = emptyCells[Math.floor(Math.random() * emptyCells.length)]!;
        const optimalMove = this.findOptimalMove({ algorithm, randomMove });
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

    public findOptimalMove({ algorithm, randomMove }: {
        algorithm: Algorithm;
        randomMove: Position;
    } = { algorithm: "alphabeta", randomMove: { x: 2, y: 2 } }): Position {
        if (this.board.isEmpty)
            return randomMove;
        const minimax = this[algorithm]();
        return minimax.move;
    }
}
