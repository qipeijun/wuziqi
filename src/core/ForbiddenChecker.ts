import { StoneType } from '@/types/game';
import { BOARD_SIZE } from '@/utils/constants';

/**
 * 禁手规则检查器 (Renju Rules)
 * 仅对黑棋生效
 */
export class ForbiddenMoveChecker {
  
  /**
   * 检查是否为禁手点
   * @param board 棋盘状态
   * @param row 行
   * @param col 列
   * @returns 如果是禁手，返回禁手类型描述；否则返回 null
   */
  public checkForbidden(board: StoneType[][], row: number, col: number): string | null {
    // 模拟落子 (Black)
    const tempBoard = board.map(r => [...r]);
    tempBoard[row][col] = StoneType.BLACK;

    // 1. 检查长连 (Overline) - 优先级最高，但在连珠规则中，长连也算禁手
    // 注意：如果是五连，那是赢了，不是禁手。禁手是 >5
    if (this.checkOverline(tempBoard, row, col)) {
      return "禁手：长连";
    }

    // 2. 检查四四 (Double Four)
    if (this.checkDoubleFour(tempBoard, row, col)) {
      return "禁手：四四";
    }

    // 3. 检查三三 (Double Three)
    if (this.checkDoubleThree(tempBoard, row, col)) {
      return "禁手：三三";
    }

    return null;
  }

  // --- 辅助函数 ---

  private checkOverline(board: StoneType[][], row: number, col: number): boolean {
    const directions = [[1, 0], [0, 1], [1, 1], [1, -1]];
    for (const [dr, dc] of directions) {
      const count = this.countConsecutive(board, row, col, dr, dc, StoneType.BLACK);
      if (count > 5) return true;
    }
    return false;
  }

  private checkDoubleFour(board: StoneType[][], row: number, col: number): boolean {
    let fourCount = 0;
    const directions = [[1, 0], [0, 1], [1, 1], [1, -1]];
    for (const [dr, dc] of directions) {
      if (this.isFour(board, row, col, dr, dc)) {
        fourCount++;
      }
    }
    return fourCount >= 2;
  }

  private checkDoubleThree(board: StoneType[][], row: number, col: number): boolean {
    let threeCount = 0;
    const directions = [[1, 0], [0, 1], [1, 1], [1, -1]];
    for (const [dr, dc] of directions) {
      if (this.isOpenThree(board, row, col, dr, dc)) {
        threeCount++;
      }
    }
    return threeCount >= 2;
  }

  private countConsecutive(
    board: StoneType[][], r: number, c: number, dr: number, dc: number, player: StoneType
  ): number {
    let count = 1;
    let i = 1;
    while (true) {
      const nr = r + dr * i;
      const nc = c + dc * i;
      if (nr < 0 || nr >= BOARD_SIZE || nc < 0 || nc >= BOARD_SIZE || board[nr][nc] !== player) break;
      count++; i++;
    }
    i = 1;
    while (true) {
      const nr = r - dr * i;
      const nc = c - dc * i;
      if (nr < 0 || nr >= BOARD_SIZE || nc < 0 || nc >= BOARD_SIZE || board[nr][nc] !== player) break;
      count++; i++;
    }
    return count;
  }

  // 简化的四判断
  private isFour(board: StoneType[][], r: number, c: number, dr: number, dc: number): boolean {
    const p = this.getLinePattern(board, r, c, dr, dc);
    // 匹配: 01111, 11110, 10111, 11011, 11101
    // 且不能是长连 (11111)
    if (p.includes("11111")) return false;

    // pattern中心点在index 4，需要检查pattern是否包含中心点
    const validFours = ["01111", "11110", "10111", "11011", "11101"];
    for (const f of validFours) {
      const idx = p.indexOf(f);
      // 检查pattern是否包含中心点（index 4）
      if (idx !== -1 && idx <= 4 && idx + f.length > 4) {
        return true;
      }
    }
    return false;
  }

  // 简化的活三判断
  private isOpenThree(board: StoneType[][], r: number, c: number, dr: number, dc: number): boolean {
    const p = this.getLinePattern(board, r, c, dr, dc);
    if (p.includes("1111")) return false; // 排除四和长连

    // pattern中心点在index 4，需要检查pattern是否包含中心点
    const validThrees = ["01110", "010110", "011010"];
    for (const t of validThrees) {
      const idx = p.indexOf(t);
      // 检查pattern是否包含中心点（index 4）
      if (idx !== -1 && idx <= 4 && idx + t.length > 4) {
        return true;
      }
    }
    return false;
  }

  // 获取以中心点为中心，半径4的线性模式字符串
  // 1=黑, 2=白/墙, 0=空
  private getLinePattern(board: StoneType[][], r: number, c: number, dr: number, dc: number): string {
    let pattern = "";
    for (let i = -4; i <= 4; i++) {
      const nr = r + dr * i;
      const nc = c + dc * i;
      if (nr < 0 || nr >= BOARD_SIZE || nc < 0 || nc >= BOARD_SIZE) {
        pattern += "2";
      } else if (board[nr][nc] === StoneType.WHITE) {
        pattern += "2";
      } else if (board[nr][nc] === StoneType.BLACK) {
        pattern += "1";
      } else {
        pattern += "0";
      }
    }
    return pattern;
  }
}
