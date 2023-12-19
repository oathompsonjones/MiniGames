import type BitBoard from "../BitBoard/BitBoard.js";
import type { PlayerType } from "./Controller.js";
import type View from "./View.js";

export type GameConstructor = new(playerOneType: PlayerType, playerTwoType: PlayerType, view?: View<BitBoard>) => Game;
export interface Game {
    play: () => Promise<number | null>;
}