/* eslint-disable @typescript-eslint/class-methods-use-this */
import type BaseBoard from "../../Base/Board.js";
import Console from "../../Console.js";
import type IntBitBoard from "../../BitBoard/IntBitBoard.js";
import type { Position } from "../../Base/Board.js";
import type View from "../../Base/View.js";

export default class ConsoleView implements View<IntBitBoard> {
    public render(board: BaseBoard<IntBitBoard>): void {
        Console.clear();
        Console.writeLine(board.toString(false));
        const { winner } = board;
        if (winner !== false)
            Console.writeLine(winner === null ? "It's a tie!" : `Player ${winner + 1} wins!`);
    }

    public async getInput(currentPlayer: { id: number; }): Promise<Position> {
        let input: string;
        let testedInput: RegExpExecArray | null = null;
        do {
            // eslint-disable-next-line no-await-in-loop
            input = await Console.readLine(`Player ${currentPlayer.id + 1}'s move (A-C)(1-3): `);
            testedInput = (/^([A-Ca-c])([1-3])$/u).exec(input);
        } while (testedInput === null);
        return { x: testedInput[1]!.toUpperCase().charCodeAt(0) - 65, y: Number(testedInput[2]) - 1 };
    }
}