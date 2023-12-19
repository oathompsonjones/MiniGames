import type BitBoard from "../BitBoard/BitBoard.js";
import type Board from "./Board.js";
import type { Position } from "./Board.js";

/**
 * Represents a game renderer.
 */
export default interface View<T extends BitBoard> {
    /**
     * Renders the game.
     *
     * @param board The board.
     */
    render: (board: Board<T>) => void;

    /**
     * Takes an input from the user.
     *
     * @param currentPlayer The current player.
     * @returns The input translated into a position.
     */
    getInput: (currentPlayer: { id: number; }) => Promise<Position>;
}