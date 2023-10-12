import type { Algorithm, PlayerType, RenderType } from "../../Base/Controller.js";
import Base from "../../Base/Controller.js";
import Board from "./Board.js";
import Console from "../../Base/Console.js";
import type IntBitBoard from "../../BitBoard/IntBitBoard.js";
import type { Position } from "../../Base/Board.js";

export default class TicTacToe extends Base<IntBitBoard> {
    public constructor(renderType: RenderType, playerOneType: PlayerType, playerTwoType: PlayerType) {
        super(new Board(), [playerOneType, playerTwoType], renderType);
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

    public async getConsoleInput(): Promise<Position> {
        let input: string;
        let testedInput: RegExpExecArray | null = null;
        do {
            // eslint-disable-next-line no-await-in-loop
            input = await Console.readLine(`Player ${this.currentPlayer.id + 1}'s move (A-C)(1-3): `);
            testedInput = (/^([A-Ca-c])([1-3])$/u).exec(input);
        } while (testedInput === null);
        return { x: testedInput[1]!.toUpperCase().charCodeAt(0) - 65, y: Number(testedInput[2]) - 1 };
    }

    public async getCanvasInput(): Promise<Position> {
        void await new Promise((): void => {
            void this;
        });
        return { x: 1, y: 1 };
        // TODO
    }

    public renderToConsole(winner: number | false | null): void {
        Console.clear();
        Console.writeLine(this.board.toString(false));
        if (winner !== false)
            Console.writeLine(winner === null ? "It's a tie!" : `Player ${winner + 1} wins!`);
    }

    public renderToCanvas(winner: number | false | null): void {
        void [this, winner];
        // TODO
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
