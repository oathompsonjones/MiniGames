/* eslint-disable @typescript-eslint/class-methods-use-this */
import type BaseBoard from "../../Base/Board.js";
import Console from "../../Console.js";
import type LongIntBitBoard from "../../BitBoard/LongIntBitBoard.js";
import type { Position } from "../../Base/Board.js";
import type View from "../../Base/View.js";

export default class ConsoleView implements View<LongIntBitBoard> {
    public render(board: BaseBoard<LongIntBitBoard>): void {
        Console.clear();
        Console.writeLine(board.toString(true, true, false, ["⬤ ", "⬤ "]));
        const { winner } = board;
        if (winner !== false)
            Console.writeLine(winner === null ? "It's a tie!" : `Player ${winner + 1} wins!`);
    }

    public async getInput(currentPlayer: { id: number; }): Promise<Position> {
        let input: string;
        let testedInput: RegExpExecArray | null = null;
        do {
            // eslint-disable-next-line no-await-in-loop
            input = await Console.readLine(`Player ${currentPlayer.id + 1}'s move (A-G): `);
            testedInput = (/^([A-Ga-g])$/u).exec(input);
        } while (testedInput === null);
        return { x: testedInput[0]!.toUpperCase().charCodeAt(0) - 65, y: 0 };
    }
}