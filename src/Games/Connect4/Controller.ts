import type { Algorithm, PlayerType } from "../../Base/Controller.js";
import Base from "../../Base/Controller.js";
import Board from "./Board.js";
import ConsoleView from "./ConsoleView.js";
import type { Position } from "../../Base/Board.js";
import type View from "../../Base/View.js";

export default class Connect4 extends Base {
    public constructor(playerOneType: PlayerType, playerTwoType: PlayerType, view?: View, id?: string) {
        super([playerOneType, playerTwoType], view ?? new ConsoleView(), id, new Board());
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
