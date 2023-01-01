import { Console, PlayerType } from "../../Utils";
import type { Position, Range } from "../../Types";
import { Controller as Base } from "../../Base";
import Board from "./Board";
import type { IntBitBoard } from "../../BitBoard";
import type { RenderType } from "../../Utils";

export class Controller extends Base<3, 3, IntBitBoard> {
    public constructor(renderType: RenderType, playerOneType: PlayerType, playerTwoType: PlayerType) {
        super(new Board(), [playerOneType, playerTwoType], renderType);
    }

    public determineCPUMove(difficulty: Omit<PlayerType, PlayerType.Human>): Position<Range<3>, Range<3>> {
        const { emptyCells } = this.board;
        const randomMove = emptyCells[Math.floor(Math.random() * emptyCells.length)]!;
        const optimalMove = this.findOptimalMove() ?? randomMove;
        switch (difficulty) {
            case PlayerType.ImpossibleCPU:
                return optimalMove;
            case PlayerType.HardCPU:
                return Math.random() < 0.8 ? optimalMove : randomMove;
            case PlayerType.MediumCPU:
                return Math.random() < 0.5 ? optimalMove : randomMove;
            case PlayerType.EasyCPU:
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
            input = await Console.readLine(`Player ${this.currentPlayer.id + 1}'s move (XY): `);
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

    public findOptimalMove(): Position<Range<3>, Range<3>> | null {
        if (this.board.isEmpty)
            return null;
        const minimax = this.minimax();
        return minimax.move;
    }
}
