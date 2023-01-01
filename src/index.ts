import { TicTacToe } from "./Games";
import { Console, PlayerType, RenderType } from "./Utils";

const games = [{ Game: TicTacToe, name: "Tic Tac Toe" }];

void (async (): Promise<unknown> => {
    Console.clear();
    const start = await Console.readLine("Would you like to play a game? (Y/N) ");
    if (start.toLowerCase() !== "y")
        return;
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
    let difficulty;
    if (playerCount === 1) {
        do {
            Console.clear();
            // eslint-disable-next-line no-await-in-loop
            const selectDifficulty = await Console.readLine("Select a difficulty (1-4):\n1. Easy\n2. Medium\n3. Hard\n4. Impossible\n");
            const difficulties = [PlayerType.EasyCPU, PlayerType.MediumCPU, PlayerType.HardCPU, PlayerType.ImpossibleCPU];
            difficulty = difficulties[parseInt(selectDifficulty, 10) - 1];
        } while (difficulty === undefined);
    }
    const { Game } = games[gameChoiceIndex]!;
    const playerOneType = playerCount > 0 ? PlayerType.Human : PlayerType.ImpossibleCPU;
    const playerTwoType = playerCount > 1 ? PlayerType.Human : difficulty ?? PlayerType.ImpossibleCPU;
    return new Game(RenderType.Console, playerOneType, playerTwoType).play();
})();
