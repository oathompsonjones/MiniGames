import type { PlayerType } from "./Utils";

// Player
interface Player<Type extends PlayerType> {
    id: number;
    playerType: Type;
}

// Minimax
interface Minimax<BoardWidth extends number, BoardHeight extends number> {
    move: Position<Range<BoardWidth>, Range<BoardHeight>>;
    score: number;
}

// Coordinate system
interface Position<XRange extends number = number, YRange extends number = number> {
    x: XRange;
    y: YRange;
}

// Ranges
type CreateArrayWithLengthX<Length extends number, Acc extends unknown[] = []> = Acc["length"] extends Length ? Acc : CreateArrayWithLengthX<Length, [...Acc, 1]>;
type NumericRange<StartArr extends number[], End extends number, Acc extends number = never> = StartArr["length"] extends End ? Acc : NumericRange<[...StartArr, 1], End, Acc | StartArr["length"]>;
type Range<End extends number> = NumericRange<[], End>;
