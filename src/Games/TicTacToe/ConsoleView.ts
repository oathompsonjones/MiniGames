/* eslint-disable @typescript-eslint/class-methods-use-this */
import Console from "../../Console.js";
import type Controller from "./Controller.js";
import type { Position } from "../../Base/Board.js";
import type View from "../../Base/View.js";

export default class ConsoleView implements View {
    public render(controller: Controller): void {
        Console.clear();
        Console.writeLine(controller.board.toString(false));
        const { winner } = controller.board;
        if (winner !== false)
            Console.writeLine(winner === null ? "It's a tie!" : `Player ${winner + 1} wins!`);
    }

    public async getInput(controller: Controller): Promise<Position> {
        let input: string;
        let testedInput: RegExpExecArray | null = null;
        do {
            // eslint-disable-next-line no-await-in-loop
            input = await Console.readLine(`Player ${controller.currentPlayer.id + 1}'s move (A-C)(1-3): `);
            testedInput = (/^([A-Ca-c])([1-3])$/u).exec(input);
        } while (testedInput === null);
        return { x: testedInput[1]!.toUpperCase().charCodeAt(0) - 65, y: Number(testedInput[2]) - 1 };
    }
}