import { StoneType } from '@/types/game';
import { PATTERN_SCORES, BOARD_SIZE } from '@/utils/constants';

/**
 * 棋型评估系统
 * 基于棋型模式识别进行打分
 * 优化：使用全盘线扫描代替单点评估
 */
export class Evaluator {
  /**
   * 评估当前局面
   * @param board 棋盘状态
   * @param aiPlayer AI执子颜色
   * @returns 评估分数（正数对AI有利，负数对对手有利）
   */
  public evaluate(board: StoneType[][], aiPlayer: StoneType): number {
    const opponent =
      aiPlayer === StoneType.BLACK ? StoneType.WHITE : StoneType.BLACK;

    // 获取所有直线（行、列、对角线）
    const lines = this.getAllLines(board);

    let aiScore = 0;
    let opponentScore = 0;

    for (const line of lines) {
      aiScore += this.evaluateLine(line, aiPlayer);
      opponentScore += this.evaluateLine(line, opponent);
    }

    return aiScore - opponentScore;
  }

  /**
   * 获取棋盘上所有的线（行、列、对角线）
   */
  private getAllLines(board: StoneType[][]): string[] {
    const lines: string[] = [];

    // 行
    for (let r = 0; r < BOARD_SIZE; r++) {
      lines.push(board[r].join(''));
    }

    // 列
    for (let c = 0; c < BOARD_SIZE; c++) {
      let col = '';
      for (let r = 0; r < BOARD_SIZE; r++) {
        col += board[r][c];
      }
      lines.push(col);
    }

    // 对角线 (右上到左下 /)
    // r + c = const (0 to 2 * BOARD_SIZE - 2)
    for (let sum = 0; sum < 2 * BOARD_SIZE - 1; sum++) {
      let diag = '';
      for (let r = 0; r < BOARD_SIZE; r++) {
        const c = sum - r;
        if (c >= 0 && c < BOARD_SIZE) {
          diag += board[r][c];
        }
      }
      if (diag.length >= 5) lines.push(diag);
    }

    // 反对角线 (左上到右下 \)
    // r - c = const (-(BOARD_SIZE-1) to BOARD_SIZE-1)
    for (let diff = -(BOARD_SIZE - 1); diff < BOARD_SIZE; diff++) {
      let diag = '';
      for (let r = 0; r < BOARD_SIZE; r++) {
        const c = r - diff;
        if (c >= 0 && c < BOARD_SIZE) {
          diag += board[r][c];
        }
      }
      if (diag.length >= 5) lines.push(diag);
    }

    return lines;
  }

  /**
   * 评估单条线上的棋型
   */
  private evaluateLine(line: string, player: StoneType): number {
    let score = 0;

    // 将线转换为简单的字符表示：X=己方, O=对方, _=空
    const p = player.toString();
    const e = StoneType.EMPTY.toString();

    // 连五: XXXXX
    const fiveRegex = new RegExp(`${p}${p}${p}${p}${p}`, 'g');
    const fiveCount = (line.match(fiveRegex) || []).length;
    score += fiveCount * PATTERN_SCORES.FIVE;

    // 如果已经有连五，直接返回
    if (fiveCount > 0) return score;

    // 活四: _XXXX_
    const activeFourRegex = new RegExp(`${e}${p}${p}${p}${p}${e}`, 'g');
    const activeFourCount = (line.match(activeFourRegex) || []).length;
    score += activeFourCount * PATTERN_SCORES.ACTIVE_FOUR;

    // 冲四: 找到所有XXXX，排除活四
    const fourRegex = new RegExp(`${p}${p}${p}${p}`, 'g');
    let fourMatches = 0;
    let match;
    fourRegex.lastIndex = 0; // Reset regex
    while ((match = fourRegex.exec(line)) !== null) {
      const index = match.index;
      const left = line[index - 1];
      const right = line[index + 4];

      const leftEmpty = left === e;
      const rightEmpty = right === e;

      // 只计算冲四（一边空，一边不空），排除活四
      if ((leftEmpty && !rightEmpty) || (!leftEmpty && rightEmpty)) {
        fourMatches++;
      }
    }
    score += fourMatches * PATTERN_SCORES.BLOCKED_FOUR;

    // 活三: _XXX_, _XX_X_, _X_XX_
    const activeThreePatterns = [
      new RegExp(`${e}${p}${p}${p}${e}`, 'g'),
      new RegExp(`${e}${p}${p}${e}${p}${e}`, 'g'),
      new RegExp(`${e}${p}${e}${p}${p}${e}`, 'g')
    ];

    for (const regex of activeThreePatterns) {
      const count = (line.match(regex) || []).length;
      score += count * PATTERN_SCORES.ACTIVE_THREE;
    }

    // 眠三: 找到所有XXX，排除活三
    const threeRegex = new RegExp(`${p}${p}${p}`, 'g');
    let threeMatches = 0;
    threeRegex.lastIndex = 0;
    while ((match = threeRegex.exec(line)) !== null) {
      const index = match.index;
      const left = line[index - 1];
      const right = line[index + 3];

      const leftEmpty = left === e;
      const rightEmpty = right === e;

      // 只计算眠三（一边空，一边不空），排除活三
      if ((leftEmpty && !rightEmpty) || (!leftEmpty && rightEmpty)) {
        threeMatches++;
      }
    }
    score += threeMatches * PATTERN_SCORES.BLOCKED_THREE;

    // 活二: _XX_, _X_X_
    const activeTwoPatterns = [
      new RegExp(`${e}${p}${p}${e}`, 'g'),
      new RegExp(`${e}${p}${e}${p}${e}`, 'g')
    ];

    for (const regex of activeTwoPatterns) {
      const count = (line.match(regex) || []).length;
      score += count * PATTERN_SCORES.ACTIVE_TWO;
    }

    return score;
  }
}
