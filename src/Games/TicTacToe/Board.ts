import Base from "../../Base/Board.js";
import IntBitBoard from "../../BitBoard/IntBitBoard.js";

export default class Board extends Base<IntBitBoard> {
    protected winningStates: IntBitBoard[] = [0x007, 0x038, 0x1C0, 0x049, 0x092, 0x124, 0x111, 0x054]
        .map((data) => new IntBitBoard(data));

    public constructor() {
        super(3, 3);
    }

    public get heuristic(): number {
        const { winner } = this;
        if (winner === 0)
            return 1;
        if (winner === 1)
            return -1;
        return 0;
    }
}
