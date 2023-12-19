import type { Algorithm, PlayerType } from "../../Base/Controller.js";
import Base from "../../Base/Controller.js";
import Board from "./Board.js";
import ConsoleView from "./ConsoleView.js";
import type IntBitBoard from "../../BitBoard/IntBitBoard.js";
import type { Position } from "../../Base/Board.js";
import type View from "../../Base/View.js";

export default class TicTacToe extends Base<IntBitBoard> {
    public constructor(playerOneType: PlayerType, playerTwoType: PlayerType, view: View<IntBitBoard> = new ConsoleView()) {
        super(new Board(), [playerOneType, playerTwoType], view);
    }

    public determineCPUMove(difficulty: Omit<PlayerType, "human">, algorithm: Algorithm = "alphabeta"): Position {
        const { emptyCells } = this.board;
        const randomMove = emptyCells[Math.floor(Math.random() * emptyCells.length)]!;
        const optimalMove = this.findOptimalMove({ algorithm }) ?? randomMove;
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

    public findOptimalMove({ algorithm }: {
        algorithm: Algorithm;
    } = { algorithm: "alphabeta" }): Position | null {
        if (this.board.isEmpty)
            return null;
        const minimax = this[algorithm]();
        return minimax.move;
    }
}
