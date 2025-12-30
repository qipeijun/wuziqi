import { Position, StoneType, AIDifficulty } from '@/types/game';
import { AIPlayer } from '@/types/ai';
import { Evaluator } from './Evaluator';
import { PatternMatcher } from './PatternMatcher';
import { BOARD_SIZE } from '@/utils/constants';
import { cloneBoard, getCenterPosition } from '@/utils/helpers';

/**
 * Minimax算法 + Alpha-Beta剪枝
 * 包含棋型识别和启发式评估
 */
export class MinimaxAI implements AIPlayer {
  private evaluator: Evaluator;
  private patternMatcher: PatternMatcher;
  private maxDepth: number;
  private searchRadius: number; // 搜索半径优化

  constructor(difficulty: AIDifficulty = AIDifficulty.MEDIUM) {
    this.evaluator = new Evaluator();
    this.patternMatcher = new PatternMatcher();
    // Initialize with default values to satisfy TypeScript
    this.maxDepth = 3;
    this.searchRadius = 2;
    this.setDifficulty(difficulty);
  }

  public setDifficulty(difficulty: AIDifficulty): void {
    switch (difficulty) {
      case AIDifficulty.EASY:
        this.maxDepth = 2;
        this.searchRadius = 1;
        break;
      case AIDifficulty.MEDIUM:
        this.maxDepth = 3;
        this.searchRadius = 2;
        break;
      case AIDifficulty.HARD:
        this.maxDepth = 4;
        this.searchRadius = 2;
        break;
    }
  }

  /**
   * 获取AI的最佳移动
   */
  public getBestMove(board: StoneType[][], aiPlayer: StoneType): Position {
    const startTime = Date.now();

    // 如果是第一步，下在中心附近
    if (this.isFirstMove(board)) {
      return this.getOpeningMove();
    }

    // 获取候选位置（只考虑已有棋子周围的位置）
    const candidates = this.getCandidatePositions(board);

    if (candidates.length === 0) {
      return getCenterPosition(BOARD_SIZE);
    }

    // 先进行威胁检测
    const criticalMove = this.checkCriticalMoves(board, aiPlayer);
    if (criticalMove) {
      console.log(
        `AI找到关键位置: (${criticalMove.row}, ${criticalMove.col}), 耗时: ${Date.now() - startTime}ms`
      );
      return criticalMove;
    }

    // Minimax搜索
    let bestScore = -Infinity;
    let bestMove = candidates[0];
    let alpha = -Infinity;
    const beta = Infinity;

    for (const candidate of candidates) {
      // 创建棋盘副本并尝试落子（不修改原始棋盘）
      const boardCopy = cloneBoard(board);
      boardCopy[candidate.row][candidate.col] = aiPlayer;

      const score = this.minimax(
        boardCopy,
        this.maxDepth - 1,
        false,
        alpha,
        beta,
        aiPlayer
      );

      if (score > bestScore) {
        bestScore = score;
        bestMove = candidate;
      }

      alpha = Math.max(alpha, score);
    }

    const elapsed = Date.now() - startTime;
    console.log(
      `AI思考完成: (${bestMove.row}, ${bestMove.col}), 分数: ${bestScore}, 耗时: ${elapsed}ms, 候选数: ${candidates.length}`
    );

    return bestMove;
  }

  /**
   * Minimax算法核心
   */
  private minimax(
    board: StoneType[][],
    depth: number,
    isMaximizing: boolean,
    alpha: number,
    beta: number,
    aiPlayer: StoneType
  ): number {
    // 终止条件
    if (depth === 0) {
      return this.evaluator.evaluate(board, aiPlayer);
    }

    const candidates = this.getCandidatePositions(board);
    if (candidates.length === 0) {
      return this.evaluator.evaluate(board, aiPlayer);
    }

    const currentPlayer = isMaximizing ? aiPlayer : this.getOpponent(aiPlayer);

    if (isMaximizing) {
      let maxScore = -Infinity;

      for (const pos of candidates) {
        // 创建棋盘副本（不修改原始棋盘）
        const boardCopy = cloneBoard(board);
        boardCopy[pos.row][pos.col] = currentPlayer;

        const score = this.minimax(boardCopy, depth - 1, false, alpha, beta, aiPlayer);

        maxScore = Math.max(maxScore, score);
        alpha = Math.max(alpha, score);

        // Alpha-Beta剪枝
        if (beta <= alpha) {
          break;
        }
      }

      return maxScore;
    } else {
      let minScore = Infinity;

      for (const pos of candidates) {
        // 创建棋盘副本（不修改原始棋盘）
        const boardCopy = cloneBoard(board);
        boardCopy[pos.row][pos.col] = currentPlayer;

        const score = this.minimax(boardCopy, depth - 1, true, alpha, beta, aiPlayer);

        minScore = Math.min(minScore, score);
        beta = Math.min(beta, score);

        if (beta <= alpha) {
          break;
        }
      }

      return minScore;
    }
  }

  /**
   * 获取候选位置（性能优化关键）
   * 只考虑已有棋子周围的空位
   */
  private getCandidatePositions(board: StoneType[][]): Position[] {
    const candidates: Position[] = [];
    const visited = Array(BOARD_SIZE).fill(false).map(() => Array(BOARD_SIZE).fill(false));
    const radius = this.searchRadius;

    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        if (board[r][c] !== StoneType.EMPTY) {
          // 在该棋子周围寻找空位
          for (let dr = -radius; dr <= radius; dr++) {
            for (let dc = -radius; dc <= radius; dc++) {
              const nr = r + dr;
              const nc = c + dc;

              if (
                nr >= 0 &&
                nr < BOARD_SIZE &&
                nc >= 0 &&
                nc < BOARD_SIZE &&
                board[nr][nc] === StoneType.EMPTY &&
                !visited[nr][nc]
              ) {
                visited[nr][nc] = true;
                candidates.push({ row: nr, col: nc });
              }
            }
          }
        }
      }
    }

    return candidates;
  }

  /**
   * 检查关键位置（必胜/必防）
   */
  private checkCriticalMoves(
    board: StoneType[][],
    aiPlayer: StoneType
  ): Position | null {
    const opponent = this.getOpponent(aiPlayer);

    // 1. 检查自己是否有必胜点
    const winMove = this.findWinningMove(board, aiPlayer);
    if (winMove) return winMove;

    // 2. 检查对手是否有必胜点（必须阻挡）
    const blockMove = this.findWinningMove(board, opponent);
    if (blockMove) return blockMove;

    // 3. 检查活四（优先级高）
    const activeFourMove = this.findActiveFour(board, aiPlayer);
    if (activeFourMove) return activeFourMove;

    // 4. 阻挡对手活四
    const blockActiveFour = this.findActiveFour(board, opponent);
    if (blockActiveFour) return blockActiveFour;

    return null;
  }

  /**
   * 查找必胜位置（连四或活三）
   */
  private findWinningMove(board: StoneType[][], player: StoneType): Position | null {
    const candidates = this.getCandidatePositions(board);

    for (const pos of candidates) {
      // 创建棋盘副本进行测试
      const boardCopy = cloneBoard(board);
      boardCopy[pos.row][pos.col] = player;

      // 检查是否形成五连
      const pattern = this.patternMatcher.analyzePosition(boardCopy, pos, player);
      if (pattern.isFive) {
        return pos;
      }
    }

    return null;
  }

  private findActiveFour(board: StoneType[][], player: StoneType): Position | null {
    const candidates = this.getCandidatePositions(board);

    for (const pos of candidates) {
      // 创建棋盘副本进行测试
      const boardCopy = cloneBoard(board);
      boardCopy[pos.row][pos.col] = player;

      const pattern = this.patternMatcher.analyzePosition(boardCopy, pos, player);
      if (pattern.isActiveFour) {
        return pos;
      }
    }

    return null;
  }

  private isFirstMove(board: StoneType[][]): boolean {
    return board.every((row) => row.every((cell) => cell === StoneType.EMPTY));
  }

  private getOpeningMove(): Position {
    // 开局下在中心附近的位置
    return getCenterPosition(BOARD_SIZE);
  }

  private getOpponent(player: StoneType): StoneType {
    return player === StoneType.BLACK ? StoneType.WHITE : StoneType.BLACK;
  }
}
