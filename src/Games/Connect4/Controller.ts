import type { Algorithm, GameConstructorOptions, PlayerType } from "../../Base/Controller.js";
import Base, { Game } from "../../Base/Controller.js";
import Board from "./Board.js";
import Console from "../../Console.js";
import type { Position } from "../../Base/Board.js";

function defaultRender(controller: Connect4): void {
    Console.clear();
    Console.writeLine(controller.board.toString(true, true, false, ["⬤ ", "⬤ "]));
    const { winner } = controller.board;
    if (winner !== false)
        Console.writeLine(winner === null ? "It's a tie!" : `Player ${winner + 1} wins!`);
}

@Game
export default class Connect4 extends Base {
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
