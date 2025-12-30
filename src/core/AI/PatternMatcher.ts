import { Position, StoneType } from '@/types/game';
import { PatternAnalysis } from '@/types/ai';
import { BOARD_SIZE } from '@/utils/constants';

/**
 * 棋型模式识别器
 * 识别五子棋中的各种棋型（连五、活四、冲四等）
 */
export class PatternMatcher {
  private readonly DIRECTIONS = [
    { dr: 0, dc: 1 },   // 水平
    { dr: 1, dc: 0 },   // 垂直
    { dr: 1, dc: 1 },   // 左上到右下
    { dr: 1, dc: -1 },  // 右上到左下
  ];

  /**
   * 分析某个位置的所有棋型
   */
  public analyzePosition(
    board: StoneType[][],
    pos: Position,
    player: StoneType
  ): PatternAnalysis {
    const result: PatternAnalysis = {
      isFive: false,
      activeFourCount: 0,
      blockedFourCount: 0,
      activeThreeCount: 0,
      blockedThreeCount: 0,
      activeTwoCount: 0,
      blockedTwoCount: 0,
      isActiveFour: false,
    };

    // 检查四个方向
    for (const dir of this.DIRECTIONS) {
      const line = this.getLine(board, pos, dir, player);
      const pattern = this.recognizePattern(line);

      this.mergePattern(result, pattern);
    }

    return result;
  }

  /**
   * 获取某个方向上的棋子序列
   * 返回格式: "XX_XXX_X" (X=己方, O=对方, _=空, B=边界)
   */
  private getLine(
    board: StoneType[][],
    pos: Position,
    dir: { dr: number; dc: number },
    player: StoneType
  ): string {
    const opponent = player === StoneType.BLACK ? StoneType.WHITE : StoneType.BLACK;
    let line = '';

    // 向两个方向延伸6格（足够检测五子棋棋型）
    for (let i = -6; i <= 6; i++) {
      const r = pos.row + i * dir.dr;
      const c = pos.col + i * dir.dc;

      if (r < 0 || r >= BOARD_SIZE || c < 0 || c >= BOARD_SIZE) {
        line += 'B'; // 边界
      } else if (board[r][c] === player) {
        line += 'X';
      } else if (board[r][c] === opponent) {
        line += 'O';
      } else {
        line += '_';
      }
    }

    return line;
  }

  /**
   * 识别棋型模式
   */
  private recognizePattern(line: string): Partial<PatternAnalysis> {
    const result: Partial<PatternAnalysis> = {};

    // 连五: XXXXX
    if (/XXXXX/.test(line)) {
      result.isFive = true;
      return result;
    }

    // 活四: _XXXX_
    if (/_XXXX_/.test(line)) {
      result.activeFourCount = 1;
      result.isActiveFour = true;
    }

    // 冲四: XXXXO, OXXXX, XXXXB, BXXXX, XX_XX, X_XXX, XXX_X
    const blockedFourPatterns = [
      /BXXXX_/,
      /_XXXXB/,
      /OXXXX_/,
      /_XXXXO/,
      /XX_XX/,
      /XXX_X/,
      /X_XXX/,
    ];
    for (const pattern of blockedFourPatterns) {
      if (pattern.test(line)) {
        result.blockedFourCount = (result.blockedFourCount || 0) + 1;
      }
    }

    // 活三: _XXX_, _XX_X_, _X_XX_
    const activeThreePatterns = [/_XXX_/, /_XX_X_/, /_X_XX_/];
    for (const pattern of activeThreePatterns) {
      if (pattern.test(line)) {
        result.activeThreeCount = (result.activeThreeCount || 0) + 1;
      }
    }

    // 眠三: OXXX_, _XXXO, BXXX_, _XXXB, BXX_X, X_XXB, OXX_X, X_XXO
    const blockedThreePatterns = [
      /BXXX_/,
      /_XXXB/,
      /OXXX_/,
      /_XXXO/,
      /BXX_X/,
      /X_XXB/,
      /OXX_X/,
      /X_XXO/,
    ];
    for (const pattern of blockedThreePatterns) {
      if (pattern.test(line)) {
        result.blockedThreeCount = (result.blockedThreeCount || 0) + 1;
      }
    }

    // 活二: _XX_, _X_X_
    const activeTwoPatterns = [/_XX_/, /_X_X_/];
    for (const pattern of activeTwoPatterns) {
      if (pattern.test(line)) {
        result.activeTwoCount = (result.activeTwoCount || 0) + 1;
      }
    }

    // 眠二: BXX_, _XXB, OXX_, _XXO, BX_X, X_XB
    const blockedTwoPatterns = [/BXX_/, /_XXB/, /OXX_/, /_XXO/, /BX_X/, /X_XB/];
    for (const pattern of blockedTwoPatterns) {
      if (pattern.test(line)) {
        result.blockedTwoCount = (result.blockedTwoCount || 0) + 1;
      }
    }

    return result;
  }

  private mergePattern(
    target: PatternAnalysis,
    source: Partial<PatternAnalysis>
  ): void {
    if (source.isFive) target.isFive = true;
    if (source.isActiveFour) target.isActiveFour = true;
    target.activeFourCount += source.activeFourCount || 0;
    target.blockedFourCount += source.blockedFourCount || 0;
    target.activeThreeCount += source.activeThreeCount || 0;
    target.blockedThreeCount += source.blockedThreeCount || 0;
    target.activeTwoCount += source.activeTwoCount || 0;
    target.blockedTwoCount += source.blockedTwoCount || 0;
  }
}
