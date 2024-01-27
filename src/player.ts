import type { GameConstructor, PlayerType } from "./base/controller.js";
import Connect4 from "./games/connect4/controller.js";
import Console from "./console.js";
import type { Position } from "./base/board.js";
import TicTacToe from "./games/tictactoe/controller.js";

const games: Array<{
    Game: GameConstructor;
    inputPrompt: string;
    inputValidator: RegExp;
    moveDimensions?: number;
}> = [
    {
        Game: TicTacToe,
        inputPrompt: "(A-C)(1-3)",
        inputValidator: /^(?<x>[A-Ca-c])(?<y>[1-3])$/u,
        moveDimensions: 2,
    },
    {
        Game: Connect4,
        inputPrompt: "(A-G)",
        inputValidator: /^(?<x>[A-Ga-g])$/u,
        moveDimensions: 1,
    },
];

/**
 * Gets a new input from the command line until a valid one is given.
 * @param isValid A function to check whether or not the given input is valid.
 * @param update A function to parse each input string.
 * @param message The prompt message for each input,
 * @returns The parsed valid input.
 */
async function getValidInput<T>(
    isValid: (value: T | undefined) => boolean,
    update: (inputString: string) => T | undefined,
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

/**
 * Sleeps for a given number of milliseconds.
 * @param ms The number of milliseconds to sleep for.
 */
async function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

/**
 * Gets a game from the command line.
 * @returns The selected game.
 */
async function getGame(): Promise<typeof games[number]> {
    return getValidInput<typeof games[number]>(
        (value) => value !== undefined,
        (inputString) => games[parseInt(inputString, 10) - 1],
        `Select a game (1-${games.length}):`,
        ...games.map(({ Game: game }, i) => `${i + 1}. ${game.name}`),
        "",
    );
}

/**
 * Gets the number of players from the command line.
 * @returns The number of players.
 */
async function getPlayerCount(): Promise<number> {
    return getValidInput<number>(
        (value) => value !== undefined && value >= 0 && value <= 2,
        (inputString) => parseInt(inputString, 10),
        "How many players? (0-2) ",
    );
}

/**
 * Gets the difficulty of the CPU player from the command line.
 * @param playerCount The number of players.
 * @returns The difficulty of the CPU player.
 */
async function getDifficulty(playerCount: number): Promise<PlayerType | undefined> {
    return playerCount === 1
        ? getValidInput(
            (value) => value !== undefined,
            (inputString) => (["easyCPU", "mediumCPU", "hardCPU", "impossibleCPU"] as const)[parseInt(inputString, 10) - 1],
            "Select a difficulty (1-4):",
            "1. Easy",
            "2. Medium",
            "3. Hard",
            "4. Impossible",
            "",
        )
        : undefined;
}

/**
 * Gets the next input from the command line.
 * @param playerID The ID of the player whose turn it is.
 * @param param1 The parameters for the game.
 * @returns The next input.
 */
async function getInput(playerID: number, { inputPrompt, inputValidator, moveDimensions }: typeof games[0]): Promise<Position> {
    let input: string;
    let testedInput: RegExpExecArray | null = null;

    do {
        // eslint-disable-next-line no-await-in-loop
        input = await Console.readLine(`Player ${playerID + 1}'s move ${inputPrompt}: `);
        testedInput = inputValidator.exec(input);
    } while (testedInput === null);

    return moveDimensions === 1
        ? { x: testedInput[0].toUpperCase().charCodeAt(0) - 65, y: 0 }
        : { x: testedInput[1]!.toUpperCase().charCodeAt(0) - 65, y: Number(testedInput[2]) - 1 };
}

await (async function main(): Promise<void> {
    Console.clear();
    const start = await Console.readLine("Would you like to play a game? (Y/N) ");

    if (start.toLowerCase() !== "y")
        return;

    const gameObject = await getGame();
    const playerCount = await getPlayerCount();
    const difficulty: PlayerType | undefined = await getDifficulty(playerCount);

    const playerOneType = playerCount > 0 ? "human" : "impossibleCPU";
    const playerTwoType = playerCount > 1 ? "human" : difficulty ?? "impossibleCPU";

    let gameOver = false;
    const game = new gameObject.Game(playerOneType, playerTwoType);

    game.on("end", () => (gameOver = true));
    await game.play();

    if (playerCount > 0) {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition, no-unmodified-loop-condition -- false positive
        while (!gameOver) {
            /* eslint-disable no-await-in-loop */
            const input = await getInput(game.currentPlayer.id, gameObject);

            game.emit("input", input);
            await sleep(10);
        }
    }

    await Console.readLine("");

    await main();
})();
