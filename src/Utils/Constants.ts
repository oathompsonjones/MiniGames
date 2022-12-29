/**
 * Defines the orientation of a line.
 *
 * @enum {number}
 */
export const enum Orientation {
    Horizontal = "horizontal",
    Vertical = "vertical",
    LeadingDiagonal = "leadingDiagonal",
    NonLeadingDiagonal = "nonLeadingDiagonal"
}

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
 * Defines how many dimensions each move has.
 *
 * - OneDimensional - row or column
 *
 * - TwoDimensional - 2D cartesian coordinates
 *
 * - ThreeDimensional - 3D cartesian coordinates
 *
 * @enum {number}
 */
export enum MoveDimensions {
    OneDimensional = 1,
    TwoDimensional = 2
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
