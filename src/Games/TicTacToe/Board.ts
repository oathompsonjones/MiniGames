import { Board as Base } from "../../Base";
import { IntBitBoard } from "../../BitBoard";

export default class Board extends Base<3, 3, IntBitBoard> {
    protected winningStates: IntBitBoard[] = [0x007, 0x038, 0x1C0, 0x049, 0x092, 0x124, 0x111, 0x054]
        .map((data) => new IntBitBoard(data));

    public constructor() {
        super(3, 3);
    }

    public get heuristic(): number {
        const { winner } = this;
        if (winner === 0)
            return 10;
        if (winner === 1)
            return -10;
        return 0;
    }
}
