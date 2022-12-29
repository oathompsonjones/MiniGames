/* eslint-disable no-console */
import { PlayerType, RenderType } from "./Utils";
import { TicTacToe } from "./Games";
import process from "process";
import readline from "readline/promises";

const games = [{ Game: TicTacToe, name: "Tic Tac Toe" }];

void (async (): Promise<unknown> => {
    console.clear();
    const reader = readline.createInterface(process.stdin, process.stdout);
    const start = await reader.question("Would you like to play a game? (Y/N) ");
    if (start.toLowerCase() !== "y")
        return reader.close();
    let gameChoiceIndex = NaN;
    do {
        console.clear();
        // eslint-disable-next-line no-await-in-loop
        const selectGame = await reader.question(`Select a game (1-${games.length}):\n${games
            .map(({ name }, i) => `${i + 1}. ${name}`)
            .join("\n")}\n`);
        gameChoiceIndex = parseInt(selectGame, 10) - 1;
    } while (isNaN(gameChoiceIndex) || gameChoiceIndex < 0 || gameChoiceIndex > games.length - 1);
    let playerCount = NaN;
    do {
        console.clear();
        // eslint-disable-next-line no-await-in-loop
        const selectPlayers = await reader.question("How many players? (0-2) ");
        playerCount = parseInt(selectPlayers, 10);
    } while (isNaN(playerCount) || playerCount < 0 || playerCount > 2);
    reader.close();
    const { Game } = games[gameChoiceIndex]!;
    const playerOneType = playerCount > 0 ? PlayerType.Human : PlayerType.ImpossibleCPU;
    const playerTwoType = playerCount > 1 ? PlayerType.Human : PlayerType.ImpossibleCPU;
    return new Game(RenderType.Console, playerOneType, playerTwoType).play();
})();
