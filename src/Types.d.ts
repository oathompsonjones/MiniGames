import type { MoveDimensions, PlayerType } from "./Utils";

// Player
interface Player<Type extends PlayerType> {
    id: number;
    playerType: Type;
}

// Minimax
interface Minimax<MoveType extends MoveDimensions, BoardWidth extends number, BoardHeight extends number> {
    move: Position<MoveType, Range<BoardWidth>, Range<BoardHeight>>; score: number;
}

// Coordinate system
type Position<
    Dimensions extends MoveDimensions = MoveDimensions.TwoDimensional,
    XRange extends number = number,
    YRange extends number = number
> = [
    never,
    XRange,
    { x: XRange; y: YRange; }
][Dimensions];

// Ranges
type CreateArrayWithLengthX<Length extends number, Acc extends unknown[] = []> = Acc["length"] extends Length ? Acc : CreateArrayWithLengthX<Length, [...Acc, 1]>;
type NumericRange<StartArr extends number[], End extends number, Acc extends number = never> = StartArr["length"] extends End ? Acc : NumericRange<[...StartArr, 1], End, Acc | StartArr["length"]>;
type Range<End extends number> = NumericRange<[], End>;
