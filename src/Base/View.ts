import type Controller from "./Controller.js";
import type { Position } from "./Board.js";

/**
 * Represents a game renderer.
 */
export default interface View {
    /**
     * Renders the game.
     *
     * @param controller The game controller.
     */
    render: (controller: Controller) => void;

    /**
     * Takes an input from the user.
     *
     * @param controller The game controller.
     * @returns The input translated into a position.
     */
    getInput: (controller: Controller) => Promise<Position>;
}