/**
 * Defines the characters used to draw a grid.
 *
 * @enum {number}
 */
export const enum GridLines {
    Horizontal = "\u2500",
    Vertical = "\u2502",
    TopLeft = "\u250C",
    TopRight = "\u2510",
    BottomLeft = "\u2514",
    BottomRight = "\u2518",
    TLeft = "\u251C",
    TRight = "\u2524",
    TTop = "\u252C",
    TBottom = "\u2534",
    Cross = "\u253C"
}

/**
 * Defines the type of player.
 *
 * @enum {number}
 */
export const enum PlayerType {
    Human = "human",
    EasyCPU = "easyCPU",
    MediumCPU = "mediumCPU",
    HardCPU = "hardCPU",
    ImpossibleCPU = "impossibleCPU"
}

/**
 * Defines the type of rendering.
 *
 * @enum {number}
 */
export enum RenderType {
    Canvas = "canvas",
    Console = "console"
}

/**
 * Defines the types of string to print for a BitBoard.
 *
 * @enum {number}
 */
export enum StringType {
    Binary = 2,
    Decimal = 10,
    Hex = 16
}
