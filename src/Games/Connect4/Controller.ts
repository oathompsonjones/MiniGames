import type { Algorithm, PlayerType, RenderType } from "../../Base/Controller.js";
import Base from "../../Base/Controller.js";
import Board from "./Board.js";
import Console from "../../Base/Console.js";
import type LongIntBitBoard from "../../BitBoard/LongIntBitBoard.js";
import type { Position } from "../../Base/Board.js";

export default class Connect4 extends Base<LongIntBitBoard> {
    public constructor(renderType: RenderType, playerOneType: PlayerType, playerTwoType: PlayerType) {
        super(new Board(), [playerOneType, playerTwoType], renderType);
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

    public async getConsoleInput(): Promise<Position> {
        let input: string;
        let testedInput: RegExpExecArray | null = null;
        do {
            // eslint-disable-next-line no-await-in-loop
            input = await Console.readLine(`Player ${this.currentPlayer.id + 1}'s move (A-G): `);
            testedInput = (/^([A-Ga-g])$/u).exec(input);
        } while (testedInput === null);
        return { x: testedInput[0]!.toUpperCase().charCodeAt(0) - 65, y: 0 };
    }

    public async getCanvasInput(): Promise<Position> {
        void await new Promise((): void => {
            void this;
        });
        return { x: -1, y: -1 };
        // TODO
    }

    public renderToConsole(winner: number | false | null): void {
        Console.clear();
        Console.writeLine(this.board.toString(true, true, false));
        if (winner !== false)
            Console.writeLine(winner === null ? "It's a tie!" : `Player ${winner + 1} wins!`);
    }

    public renderToCanvas(winner: number | false | null): void {
        void [this, winner];
        // TODO
    }

    // TODO Sometimes makes illegal move
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
