export { default as TicTacToeController } from "./games/tictactoe/controller.js";
export type { default as TicTacToeBoard } from "./games/tictactoe/board.js";

export { default as Connect4Controller } from "./games/connect4/controller.js";
export type { default as Connect4Board } from "./games/connect4/board.js";

export type {
    default as Controller,
    PlayerType,
    Algorithm,
    GameConstructorOptions,
    GameConstructor,
} from "./base/controller.js";
export type {
    default as Board,
    Position,
    GridLines,
} from "./base/board.js";

export type { default as BitBoard } from "./bitBoard/bitBoard.js";
export type { default as IntBitBoard } from "./bitBoard/intBitBoard.js";
export type { default as LongInt } from "./bitBoard/longInt.js";
export type { default as LongIntBitBoard } from "./bitBoard/longIntBitBoard.js";
