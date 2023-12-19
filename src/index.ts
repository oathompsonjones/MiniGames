import Connect4 from "./Games/Connect4/Controller.js";
import Console from "./Console.js";
import type { GameConstructor } from "./Base/Game.js";
import type { PlayerType } from "./Base/Controller.js";
import TicTacToe from "./Games/TicTacToe/Controller.js";


const games: GameConstructor[] = [
    TicTacToe,
    Connect4
];

async function getValidInput<T>(
    isValid: (value: T | undefined) => boolean,
    update: (input: string) => T | undefined,
    ...message: string[]
): Promise<T> {
    let output: T | undefined;
    do {
        Console.clear();
        // eslint-disable-next-line no-await-in-loop
        const inputString = await Console.readLine(message.join("\n"));
        output = update(inputString);
    } while (!isValid(output));
    return output!;
}

async function main(): Promise<void> {
    Console.clear();
    const start = await Console.readLine("Would you like to play a game? (Y/N) ");
    if (start.toLowerCase() !== "y")
        return;

    const Game: GameConstructor = await getValidInput(
        (value) => value !== undefined,
        (inputString) => games[parseInt(inputString, 10) - 1],
        `Select a game (1-${games.length}):`,
        ...games.map(({ name }, i) => `${i + 1}. ${name}`),
        ""
    );

    const playerCount: number = await getValidInput(
        (value) => value !== undefined && value >= 0 && value <= 2,
        (inputString) => parseInt(inputString, 10),
        "How many players? (0-2) "
    );

    const difficulty: PlayerType | undefined = playerCount === 1 ? await getValidInput(
        (value) => value !== undefined,
        (inputString) => (["easyCPU", "mediumCPU", "hardCPU", "impossibleCPU"] as const)[parseInt(inputString, 10) - 1],
        "Select a difficulty (1-4):",
        "1. Easy",
        "2. Medium",
        "3. Hard",
        "4. Impossible",
        ""
    ) : undefined;

    const playerOneType = playerCount > 0 ? "human" : "impossibleCPU";
    const playerTwoType = playerCount > 1 ? "human" : difficulty ?? "impossibleCPU";

    await new Game(playerOneType, playerTwoType).play();
    await Console.readLine("");

    return main();
}
await main();
