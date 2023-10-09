import Connect4 from "./Games/Connect4/Controller.js";
import Console from "./Base/Console.js";
import type { PlayerType } from "./Base/Controller.js";
import TicTacToe from "./Games/TicTacToe/Controller.js";

const games = [
    TicTacToe,
    Connect4
];

Console.clear();

const start = await Console.readLine("Would you like to play a game? (Y/N) ");
if (start.toLowerCase() !== "y")
    process.exit(0);

let gameChoiceIndex = NaN;

do {
    Console.clear();
    // eslint-disable-next-line no-await-in-loop
    const selectGame = await Console.readLine(`Select a game (1-${games.length}):\n${games
        .map(({ name }, i) => `${i + 1}. ${name}`)
        .join("\n")}\n`);
    gameChoiceIndex = parseInt(selectGame, 10) - 1;
} while (isNaN(gameChoiceIndex) || gameChoiceIndex < 0 || gameChoiceIndex > games.length - 1);

let playerCount = NaN;

do {
    Console.clear();
    // eslint-disable-next-line no-await-in-loop
    const selectPlayers = await Console.readLine("How many players? (0-2) ");
    playerCount = parseInt(selectPlayers, 10);
} while (isNaN(playerCount) || playerCount < 0 || playerCount > 2);

let difficulty: PlayerType | undefined;

if (playerCount === 1) {
    do {
        Console.clear();
        // eslint-disable-next-line no-await-in-loop
        const selectDifficulty = await Console.readLine([
            "Select a difficulty (1-4):",
            "1. Easy",
            "2. Medium",
            "3. Hard",
            "4. Impossible\n"
        ].join("\n"));
        const difficulties: PlayerType[] = ["easyCPU", "mediumCPU", "hardCPU", "impossibleCPU"];
        difficulty = difficulties[parseInt(selectDifficulty, 10) - 1];
    } while (difficulty === undefined);
}

const Game = games[gameChoiceIndex]!;
const playerOneType = playerCount > 0 ? "human" : "impossibleCPU";
const playerTwoType = playerCount > 1 ? "human" : difficulty ?? "impossibleCPU";

const winners = [];
if (playerCount > 0) {
    void new Game("console", playerOneType, playerTwoType).play();
} else {
    for (let i = 0; i < 1000; i++)
        winners.push(new Game("console", playerOneType, playerTwoType).play());
    const alwaysATie = (await Promise.all(winners)).every((winner) => winner === null);
    Console.writeLine(alwaysATie ? `${winners.length} ties!` : "Not always a draw");
}
