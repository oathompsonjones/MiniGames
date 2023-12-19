import type { Algorithm, PlayerType } from "../../Base/Controller.js";
import Base from "../../Base/Controller.js";
import Board from "./Board.js";
import ConsoleView from "./ConsoleView.js";
import type { Position } from "../../Base/Board.js";
import type View from "../../Base/View.js";

export default class TicTacToe extends Base {
    public constructor(playerOneType: PlayerType, playerTwoType: PlayerType, view?: View, id?: string) {
        super([playerOneType, playerTwoType], view ?? new ConsoleView(), id, new Board());
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
