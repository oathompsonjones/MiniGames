import Connect4 from "./Games/Connect4/Controller.js";
import Console from "./Base/Console.js";
import type { PlayerType } from "./Base/Controller.js";
import TicTacToe from "./Games/TicTacToe/Controller.js";

const games = [
    TicTacToe,
    Connect4
];

async function input(message: string): Promise<string> {
    Console.clear();
    return Console.readLine(message);
}

await (async function main(): Promise<void> {
    const start = await input("Would you like to play a game? (Y/N) ");
    if (start.toLowerCase() !== "y")
        process.exit(0);

    let gameChoiceIndex = NaN;

    do {
        // eslint-disable-next-line no-await-in-loop
        const selectGame = await input(`Select a game (1-${games.length}):\n${games
            .map(({ name }, i) => `${i + 1}. ${name}`)
            .join("\n")}\n`);
        gameChoiceIndex = parseInt(selectGame, 10) - 1;
    } while (isNaN(gameChoiceIndex) || gameChoiceIndex < 0 || gameChoiceIndex > games.length - 1);

    let playerCount = NaN;

    do {
        // eslint-disable-next-line no-await-in-loop
        const selectPlayers = await input("How many players? (0-2) ");
        playerCount = parseInt(selectPlayers, 10);
    } while (isNaN(playerCount) || playerCount < 0 || playerCount > 2);

    let difficulty: PlayerType | undefined;

    if (playerCount === 1) {
        do {
            // eslint-disable-next-line no-await-in-loop
            const selectDifficulty = await input([
                "Select a difficulty (1-4):",
                "1. Easy",
                "2. Medium",
                "3. Hard",
                "4. Impossible\n"
            ].join("\n"));
            difficulty = (["easyCPU", "mediumCPU", "hardCPU", "impossibleCPU"] as const)[parseInt(selectDifficulty, 10) - 1];
        } while (difficulty === undefined);
    }

    const Game = games[gameChoiceIndex]!;
    const playerOneType = playerCount > 0 ? "human" : "impossibleCPU";
    const playerTwoType = playerCount > 1 ? "human" : difficulty ?? "impossibleCPU";

    const winners = [];
    if (playerCount > 0) {
        await new Game("console", playerOneType, playerTwoType).play();
    } else {
        for (let i = 0; i < 1000; i++)
            winners.push(new Game("console", playerOneType, playerTwoType).play());
        Console.writeLine(
            (await Promise.all(winners)).every((winner) => winner === null)
                ? `${winners.length} ties!`
                : "Not always a draw"
        );
    }

    await Console.readLine("");

    return main();
})();
