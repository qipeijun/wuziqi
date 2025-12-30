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
    // 注意：StoneType 实际上是数字 (0, 1, 2)，需要正确映射
    // 假设 StoneType.EMPTY=0, BLACK=1, WHITE=2 (需要确认 types/game.ts)
    // 为了安全，直接用 replace

    // 这里我们假设 line 是由 StoneType 组成的字符串 (e.g. "001200")
    // 我们需要将其转换为统一格式以便正则匹配

    // 构造正则匹配字符串
    const p = player.toString();
    const e = StoneType.EMPTY.toString();

    // 连五: XXXXX
    const fiveRegex = new RegExp(`${p}${p}${p}${p}${p}`, 'g');
    const fiveCount = (line.match(fiveRegex) || []).length;
    score += fiveCount * PATTERN_SCORES.FIVE;

    // 活四: _XXXX_
    const activeFourRegex = new RegExp(`${e}${p}${p}${p}${p}${e}`, 'g');
    const activeFourCount = (line.match(activeFourRegex) || []).length;
    score += activeFourCount * PATTERN_SCORES.ACTIVE_FOUR;

    // 冲四: OXXXX_, _XXXXO, OXXXXO (被堵一边)
    // 注意：活四也会被下面的正则匹配到，所以需要减去活四的分数或者小心构造正则
    // 简单起见，我们先匹配活四，然后把活四替换掉，再匹配冲四？
    // 或者使用更复杂的正则。

    // 更好的方法：查找所有 "XXXX"
    const fourRegex = new RegExp(`${p}${p}${p}${p}`, 'g');
    let match;
    while ((match = fourRegex.exec(line)) !== null) {
      const index = match.index;
      const left = line[index - 1];
      const right = line[index + 4];

      const leftEmpty = left === e;
      const rightEmpty = right === e;

      if (leftEmpty && rightEmpty) {
        // 活四，已经算过了，这里不加分 (或者在这里算，上面去掉)
        // 实际上上面算过了，这里不做处理
      } else if (leftEmpty || rightEmpty) {
        score += PATTERN_SCORES.BLOCKED_FOUR;
      }
    }

    // 活三: _XXX_ (且至少有一边还能下) -> 其实 _XXX_ 就是活三
    // 还有 _XX_X_ 和 _X_XX_
    const activeThreePatterns = [
      `${e}${p}${p}${p}${e}`,
      `${e}${p}${p}${e}${p}${e}`,
      `${e}${p}${e}${p}${p}${e}`
    ];

    for (const pat of activeThreePatterns) {
      const regex = new RegExp(pat, 'g');
      const count = (line.match(regex) || []).length;
      score += count * PATTERN_SCORES.ACTIVE_THREE;
    }

    // 眠三 (略复杂，简化处理，只匹配连在一起的)
    // OXXX_, _XXXO
    const threeRegex = new RegExp(`${p}${p}${p}`, 'g');
    while ((match = threeRegex.exec(line)) !== null) {
      const index = match.index;
      const left = line[index - 1];
      const right = line[index + 3];

      const leftEmpty = left === e;
      const rightEmpty = right === e;

      if (leftEmpty && rightEmpty) {
        // 活三，上面算过了
      } else if (leftEmpty || rightEmpty) {
        score += PATTERN_SCORES.BLOCKED_THREE;
      }
    }

    // 活二
    const activeTwoRegex = new RegExp(`${e}${p}${p}${e}`, 'g');
    const activeTwoCount = (line.match(activeTwoRegex) || []).length;
    score += activeTwoCount * PATTERN_SCORES.ACTIVE_TWO;

    return score;
  }
}
