import { StoneType, Position } from '@/types/game';
import { BOARD_SIZE } from '@/utils/constants';

export class WinChecker {
  private directions = [
    { dr: 1, dc: 0 }, // Vertical
    { dr: 0, dc: 1 }, // Horizontal
    { dr: 1, dc: 1 }, // Diagonal \
    { dr: 1, dc: -1 }, // Diagonal /
  ];

  public checkWin(board: StoneType[][], lastMove: Position, enableForbidden: boolean = false): boolean {
    const { row, col } = lastMove;
    const player = board[row][col];

    if (player === StoneType.EMPTY) return false;

    for (const { dr, dc } of this.directions) {
      const count = this.countConsecutive(board, row, col, dr, dc, player);

      // 恰好5连：获胜
      if (count === 5) {
        return true;
      }

      // 长连（6+）：如果是黑棋且启用禁手，则不算赢；否则算赢
      if (count > 5) {
        if (enableForbidden && player === StoneType.BLACK) {
          // 黑棋长连是禁手，不算获胜
          continue;
        }
        return true;
      }
    }

    return false;
  }

  public getWinningStones(board: StoneType[][], lastMove: Position): Position[] {
    const { row, col } = lastMove;
    const player = board[row][col];
    
    if (player === StoneType.EMPTY) return [];

    for (const { dr, dc } of this.directions) {
      const stones = this.getConsecutiveStones(board, row, col, dr, dc, player);
      if (stones.length >= 5) {
        return stones;
      }
    }

    return [];
  }

  public checkDraw(board: StoneType[][]): boolean {
    return board.every((row) => row.every((cell) => cell !== StoneType.EMPTY));
  }

  private countConsecutive(
    board: StoneType[][],
    r: number,
    c: number,
    dr: number,
    dc: number,
    player: StoneType
  ): number {
    let count = 1;
    
    // Check forward
    let i = 1;
    while (true) {
      const nr = r + dr * i;
      const nc = c + dc * i;
      if (!this.isValid(nr, nc) || board[nr][nc] !== player) break;
      count++;
      i++;
    }

    // Check backward
    i = 1;
    while (true) {
      const nr = r - dr * i;
      const nc = c - dc * i;
      if (!this.isValid(nr, nc) || board[nr][nc] !== player) break;
      count++;
      i++;
    }

    return count;
  }

  private getConsecutiveStones(
    board: StoneType[][],
    r: number,
    c: number,
    dr: number,
    dc: number,
    player: StoneType
  ): Position[] {
    const stones: Position[] = [{ row: r, col: c }];
    
    // Check forward
    let i = 1;
    while (true) {
      const nr = r + dr * i;
      const nc = c + dc * i;
      if (!this.isValid(nr, nc) || board[nr][nc] !== player) break;
      stones.push({ row: nr, col: nc });
      i++;
    }

    // Check backward
    i = 1;
    while (true) {
      const nr = r - dr * i;
      const nc = c - dc * i;
      if (!this.isValid(nr, nc) || board[nr][nc] !== player) break;
      stones.push({ row: nr, col: nc });
      i++;
    }

    return stones;
  }

  private isValid(row: number, col: number): boolean {
    return row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE;
  }
}
