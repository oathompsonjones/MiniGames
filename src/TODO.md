- Hard code winning states instead of looking for lines.
- Rather than using 2 bits per cell, use separate BitBoards for each player. If small enough, these can be combined again.
- Noughts and Crosses BitBoard can extend an abstract BitBoard.
    - This can implement the hard coded winning states, as well as checking for draw states by using | instead of looping.
- Store as much game state as possible in the BitBoard instead of using extra variables.
    - The state takes 18 bits, the remaining 14 can store other states, i.e. Game over, who's turn, etc.
    - These states can then use getters for better code readability.


# BitBoard Based games
### NoughtsAndCrosses
NumericBitBoard  32 bits [9: p1 board][9: p2 board][1: turn][1: p1 winner][1: p2 winner][1: full][1: empty][9]
### Connect4
LongIntBitBoard  96 bits [42: p1 board][42: p2 board][1: turn][1: p1 winner][1: p2 winner][1: full][8]
### Battleships
LongIntBitBoard 608 bits [100: p1 ships][100: p2 ships][100: p1 hits][100: p2 hits][100: p1 misses][100: p2 misses][1: turn][1: p1 winner][1: p2 winner][5]
### Checkers
LongIntBitBoard 288 bits [64: p1 board][64: p2 board][64: p1 kings][64: p2 kings][1: turn][1: p1 winner][1: p2 winner][29]
### Chess
LongIntBitBoard
### Othello
LongIntBitBoard
### Sudoku
LongIntBitBoard
### Dots
LongIntBitBoard

# Other
Breakout            
PacMan
Pong
Snake
Solitaire
SpaceInvaders
Tetris