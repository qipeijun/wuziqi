import { Position, StoneType } from '@/types/game';

/**
 * 五子棋胜负判定器
 * 高效算法：只检查最后一步落子周围的四个方向
 */
export class WinChecker {
  private readonly BOARD_SIZE = 15;
  private readonly WIN_COUNT = 5;

  // 四个方向：水平、垂直、左斜、右斜
  private readonly DIRECTIONS = [
    { dr: 0, dc: 1 },   // 水平
    { dr: 1, dc: 0 },   // 垂直
    { dr: 1, dc: 1 },   // 左上到右下
    { dr: 1, dc: -1 },  // 右上到左下
  ];

  /**
   * 检查是否获胜
   * @param board 棋盘状态
   * @param lastMove 最后一步移动
   * @returns 是否获胜
   */
  public checkWin(board: StoneType[][], lastMove: Position): boolean {
    const player = board[lastMove.row][lastMove.col];

    if (player === StoneType.EMPTY) return false;

    // 检查四个方向
    for (const dir of this.DIRECTIONS) {
      const count = this.countInDirection(board, lastMove, player, dir);
      if (count >= this.WIN_COUNT) {
        return true;
      }
    }

    return false;
  }

  /**
   * 计算某个方向上连续相同棋子的数量
   */
  private countInDirection(
    board: StoneType[][],
    pos: Position,
    player: StoneType,
    dir: { dr: number; dc: number }
  ): number {
    let count = 1; // 包含当前位置

    // 正向搜索
    count += this.countStones(board, pos, player, dir.dr, dir.dc);
    // 反向搜索
    count += this.countStones(board, pos, player, -dir.dr, -dir.dc);

    return count;
  }

  /**
   * 沿着某个方向计数
   */
  private countStones(
    board: StoneType[][],
    pos: Position,
    player: StoneType,
    dr: number,
    dc: number
  ): number {
    let count = 0;
    let r = pos.row + dr;
    let c = pos.col + dc;

    while (
      r >= 0 &&
      r < this.BOARD_SIZE &&
      c >= 0 &&
      c < this.BOARD_SIZE &&
      board[r][c] === player
    ) {
      count++;
      r += dr;
      c += dc;
    }

    return count;
  }

  /**
   * 检查是否平局（棋盘已满）
   */
  public checkDraw(board: StoneType[][]): boolean {
    return board.every((row) => row.every((cell) => cell !== StoneType.EMPTY));
  }

  /**
   * 获取获胜的棋子位置（用于高亮显示）
   */
  public getWinningStones(board: StoneType[][], lastMove: Position): Position[] {
    const player = board[lastMove.row][lastMove.col];

    for (const dir of this.DIRECTIONS) {
      const stones = this.getStoneLineInDirection(board, lastMove, player, dir);
      if (stones.length >= this.WIN_COUNT) {
        return stones;
      }
    }

    return [];
  }

  private getStoneLineInDirection(
    board: StoneType[][],
    pos: Position,
    player: StoneType,
    dir: { dr: number; dc: number }
  ): Position[] {
    const line: Position[] = [{ ...pos }];

    // 正向
    let r = pos.row + dir.dr;
    let c = pos.col + dir.dc;
    while (
      r >= 0 &&
      r < this.BOARD_SIZE &&
      c >= 0 &&
      c < this.BOARD_SIZE &&
      board[r][c] === player
    ) {
      line.push({ row: r, col: c });
      r += dir.dr;
      c += dir.dc;
    }

    // 反向
    r = pos.row - dir.dr;
    c = pos.col - dir.dc;
    while (
      r >= 0 &&
      r < this.BOARD_SIZE &&
      c >= 0 &&
      c < this.BOARD_SIZE &&
      board[r][c] === player
    ) {
      line.unshift({ row: r, col: c });
      r -= dir.dr;
      c -= dir.dc;
    }

    return line;
  }
}
